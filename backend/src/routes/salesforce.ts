import { Request, Response, Router } from 'express';
import prisma from '../prisma';
import {
  SalesforceAccount,
  SalesforceContact,
  SalesforceQueryResponse,
} from '../types/salesforce';

const router = Router();

const CLIENT_ID = process.env.SALESFORCE_CLIENT_ID!;
const CLIENT_SECRET = process.env.SALESFORCE_CLIENT_SECRET!;
const INSTANCE_URL = process.env.SALESFORCE_INSTANCE_URL!;
const AUTH_URL = process.env.SALESFORCE_AUTH_URL!;

async function getAccessToken(): Promise<string> {
  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }).toString(),
  });

  if (!response.ok) {
    console.error('Error obtaining access token', await response.text());
    throw new Error('Failed to authenticate with Salesforce');
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

router.post(
  '/sync-account',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, name, email, phone } = req.body;
      if (!userId || !name || !email) {
        res
          .status(400)
          .json({ error: 'User ID, name, and email are required' });
        return;
      }

      const accessToken = await getAccessToken();

      const user = await prisma.user.findUnique({ where: { id: userId } });
      let salesforceAccountId = user?.salesforceAccountId;
      let salesforceContactId = user?.salesforceContactId;

      if (!salesforceAccountId) {
        const accountResponse = await fetch(
          `${INSTANCE_URL}/services/data/v59.0/sobjects/Account`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              Name: name,
              AccountNumber: userId, // Set Account Number to userId
            }),
          },
        );

        if (!accountResponse.ok) {
          console.error('Error creating account', await accountResponse.text());
          res
            .status(500)
            .json({ error: 'Failed to create Salesforce Account' });
          return;
        }

        const accountData = (await accountResponse.json()) as { id: string };
        salesforceAccountId = accountData.id;

        await prisma.user.update({
          where: { id: userId },
          data: { salesforceAccountId },
        });
      }

      if (!salesforceContactId) {
        const contactResponse = await fetch(
          `${INSTANCE_URL}/services/data/v59.0/sobjects/Contact`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              LastName: name,
              Email: email,
              Phone: phone || '',
              AccountId: salesforceAccountId, // Link to Account
            }),
          },
        );

        if (!contactResponse.ok) {
          console.error('Error creating contact', await contactResponse.text());
          res
            .status(500)
            .json({ error: 'Failed to create Salesforce Contact' });
          return;
        }

        const contactData = (await contactResponse.json()) as { id: string };
        salesforceContactId = contactData.id;

        await prisma.user.update({
          where: { id: userId },
          data: { salesforceContactId },
        });
      } else {
        const updateResponse = await fetch(
          `${INSTANCE_URL}/services/data/v59.0/sobjects/Contact/${salesforceContactId}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              LastName: name,
              Email: email,
              Phone: phone || '',
            }),
          },
        );

        if (!updateResponse.ok) {
          console.error('Error updating contact', await updateResponse.text());
          res
            .status(500)
            .json({ error: 'Failed to update Salesforce Contact' });
          return;
        }
      }

      res.json({
        message: 'Account and Contact processed successfully',
        salesforceAccountId,
        salesforceContactId,
      });
    } catch (error) {
      console.error('Salesforce API error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
);

router.get(
  '/check-account/:userId',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const accessToken = await getAccessToken();

      const accountQuery = `SELECT Id, Name FROM Account WHERE AccountNumber = '${userId}' LIMIT 1`;
      const accountResponse = await fetch(
        `${INSTANCE_URL}/services/data/v59.0/query?q=${encodeURIComponent(accountQuery)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!accountResponse.ok) {
        console.error(
          'Error querying Salesforce',
          await accountResponse.text(),
        );
        res.status(500).json({ error: 'Failed to query Salesforce' });
        return;
      }

      const accountData =
        (await accountResponse.json()) as SalesforceQueryResponse<SalesforceAccount>;
      const account = accountData.records[0];

      if (!account) {
        res.json({ exists: false });
        return;
      }

      const contactQuery = `SELECT Id, LastName, Email, Phone FROM Contact WHERE AccountId = '${account.Id}' LIMIT 1`;
      const contactResponse = await fetch(
        `${INSTANCE_URL}/services/data/v59.0/query?q=${encodeURIComponent(contactQuery)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!contactResponse.ok) {
        console.error(
          'Error querying Salesforce',
          await contactResponse.text(),
        );
        res.status(500).json({ error: 'Failed to query Salesforce' });
        return;
      }

      const contactData =
        (await contactResponse.json()) as SalesforceQueryResponse<SalesforceContact>;
      const contact = contactData.records[0];

      res.json({
        exists: true,
        account: {
          id: account.Id,
          name: account.Name,
        },
        contact: {
          id: contact.Id,
          lastName: contact.LastName,
          email: contact.Email,
          phone: contact.Phone,
        },
      });
    } catch (error) {
      console.error('Salesforce API error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
);

export default router;
