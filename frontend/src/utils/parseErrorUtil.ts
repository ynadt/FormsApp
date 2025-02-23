export async function parseError(res: Response): Promise<string> {
  try {
    const errorData = await res.json();
    return errorData.error || 'An error occurred';
  } catch {
    return await res.text();
  }
}
