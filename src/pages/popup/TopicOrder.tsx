import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup, {
  toggleButtonGroupClasses,
} from '@mui/material/ToggleButtonGroup';
import LinearProgress from '@mui/material/LinearProgress';

interface TopicFilterProps {
  orders: Array<{
    name: string;
    value: string;
    icon?: React.ReactNode;
  }>
  value: string
  onChange: (value: string) => void
  loading: boolean
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    margin: theme.spacing(0.5),
    border: 0,
    borderRadius: theme.shape.borderRadius,
    [`&.${toggleButtonGroupClasses.disabled}`]: {
      border: 0,
    },
  },
  [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]:
    {
      marginLeft: -1,
      borderLeft: '1px solid transparent',
    },
}));

export function TopicOrder({ orders, value, onChange, loading }: TopicFilterProps) {
  const handleChangeOrder = (
    _event: React.MouseEvent<HTMLElement>,
    newOrder: string,
  ) => {
    onChange(newOrder);
  };

  return (
    <div>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          borderBottom: (theme) => loading ? 'none' : `1px solid ${theme.palette.divider}`,
          borderRadius: 0,
          flexWrap: 'wrap'
        }}
      >
        <StyledToggleButtonGroup
          size="small"
          value={value}
          exclusive
          onChange={handleChangeOrder}
          aria-label="topics order"
        >
          {
            orders.map((order) => (
              <ToggleButton value={order.value} aria-label={order.name}>
                <Typography
                  variant="caption"
                >
                  {order.name}
                </Typography>
              </ToggleButton>
            ))
          }
        </StyledToggleButtonGroup>
        {
          loading && (
            <LinearProgress
              sx={{
                height: '1px',
                flexBasis: '100%'
              }}
            />
          )
        }
      </Paper>
    </div>
  );
}
