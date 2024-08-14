import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Button from '@mui/material/IconButton';
import Popper from '@mui/material/Popper';
import MenuList from '@mui/material/MenuList';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import NoteEdit from '@mui/icons-material/EditNoteRounded'
import Close from '@mui/icons-material/Close'
import { Config } from '@src/core/config.ts';

interface DropdownProp {
  container: Element
  onSelect?: (value: string) => void
}

const CONTENT = [
  '谢谢分享，感谢佬',
  'CCC，一天到晚就知道 C',
  '来不及解释了，快上车',
]

export function DropdownComponent({ container, onSelect }: DropdownProp) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const [config, updateConfig] = useState<Config | null>(null);

  useEffect(() => {
    const config = new Config()
    config.init().then(() => updateConfig(config))
  }, []);

  const contents = !config?.shortcuts?.length ? CONTENT : config.shortcuts

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    config?.init()
  };

  const open = Boolean(anchorEl);
  const id = open ? 'linux-do-plugin-popper' : undefined;

  useEffect(() => {
    if (!open) return;

    const handleMoveOutside = () => {
      setAnchorEl(null);
    };
    container.addEventListener('mouseleave', handleMoveOutside);
    return () => {
      document.removeEventListener('mouseleave', handleMoveOutside);
    };
  }, [open, anchorEl, container]);

  const handleRemove = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
    event.stopPropagation();
    const newContents = [...contents]
    newContents.splice(index, 1)
    config?.updateConfig('shortcuts', newContents)
  }

  return (
    <div>
      <Button
        aria-describedby={id}
        onMouseEnter={handleClick}
        color="secondary"
      >
        <NoteEdit/>
      </Button>
      <Popper
        id={id}
        sx={{ zIndex: 1200000 }}
        open={open}
        anchorEl={anchorEl}
        placement="left"
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              sx={{
                maxWidth: 400,
              }}
            >
              <MenuList dense>
                {
                  contents.map((content, index) => (
                    <MenuItem key={index} onClick={() => onSelect?.(content)}>
                      <ListItemText>
                        <Typography noWrap>{content}</Typography>
                      </ListItemText>
                      <Button
                        sx={{
                          ml: 2,
                        }}
                        color="error"
                        size="small"
                        onClick={(e) => handleRemove(e, index)}
                      >
                        <Close/>
                      </Button>
                    </MenuItem>
                  ))
                }
              </MenuList>
            </Paper>
          </Fade>
        )}
      </Popper>
    </div>
  )
}

export const Dropdown = observer(DropdownComponent)
