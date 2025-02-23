import { IconButton } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: 'absolute',
        right: '-40px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1,
        backgroundColor: 'rgba(170,170,170,0.17)',
        '&:hover': {
          backgroundColor: 'rgb(210,211,217)',
        },
      }}
    >
      <ArrowForwardIosIcon />
    </IconButton>
  );
};

export const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: 'absolute',
        left: '-40px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1,
        backgroundColor: 'rgba(170,170,170,0.13)',
        '&:hover': {
          backgroundColor: 'rgba(210,211,217,0.71)',
        },
      }}
    >
      <ArrowBackIosIcon />
    </IconButton>
  );
};
