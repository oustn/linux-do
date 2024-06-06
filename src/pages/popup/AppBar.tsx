import * as React from 'react';
import MaterialAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { avatarUrl, handlerLogin, goto } from '@src/utils';
import Avatar from '@mui/material/Avatar';
import { UserBasic, UserSummary } from '@src/core/type';

interface AppBarProps {
  isLogin: boolean;
  userSummary: UserSummary | null;
  userBasic: UserBasic | null;
  unreadNotification: number;
  unreadPrivateMessage: number;
}


export function AppBar(props: AppBarProps) {
  const { isLogin, userBasic, unreadNotification, unreadPrivateMessage } = props;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = async (event: React.MouseEvent<HTMLElement>) => {
    if (!isLogin) {
      await handlerLogin();
      return;
    }

    setAnchorEl(event.currentTarget);
  };

  const handleHome = async () => {
    await goto(`https://linux.do`)
  }

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 0, flexShrink: 0 }}>
      <MaterialAppBar position="static">
        <Toolbar>
          <Box
            display="flex"
            sx={{
              cursor: 'pointer',
            }}
            onClick={handleHome}
          >
            <img
              height="28px"
              src="icons/active128.png"
              loading="lazy"
              alt="Linux Do"
            />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ display: 'block', ml: 1 }}
            >
              LINUX DO
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex' }}>
            {
              isLogin && (
                <React.Fragment>
                  <IconButton size="large" aria-label="show unread private message" color="inherit">
                    <Badge badgeContent={unreadPrivateMessage} color="error">
                    <MailIcon />
                    </Badge>
                  </IconButton>
                  <IconButton
                    size="large"
                    aria-label="show new notifications"
                    color="inherit"
                  >
                    <Badge badgeContent={unreadNotification} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </React.Fragment>
              )
            }
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{ p: '10px' }}
            >
              {
                !isLogin && <AccountCircle sx={{ fontSize: 28 }} />
              }
              {
                isLogin && <Avatar
                  sx={{
                    width: '28px',
                    height: '28px',
                  }}
                  alt={userBasic?.name}
                  src={avatarUrl(userBasic?.avatar_template || '')}
                />
              }
            </IconButton>
          </Box>
        </Toolbar>
      </MaterialAppBar>
      {renderMenu}
    </Box>
  );
}
