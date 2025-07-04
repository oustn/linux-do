import * as React from 'react';
import HoverPopover from 'material-ui-popup-state/HoverPopover';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CircularProgress from '@mui/material/CircularProgress';
import {
  usePopupState,
  bindHover,
  bindPopover,
} from 'material-ui-popup-state/hooks';
import { useRuntime } from '@src/pages/hooks/useRuntime.tsx';
import { PostDetail } from '@src/discourse/types.ts';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Badge, { badgeClasses } from '@mui/material/Badge';

const CartBadge = styled(Badge)`
    & .${badgeClasses.badge} {
        top: -12px;
        right: -6px;
    }
`;

const reactions = [
  {
    'icon': 'https://linux.do/images/emoji/twemoji/heart.png?v=14',
    'reaction': 'heart',
  },
  {
    'icon': 'https://linux.do/images/emoji/twemoji/+1.png?v=14',
    'reaction': '+1',
  },
  {
    'icon': 'https://linux.do/images/emoji/twemoji/laughing.png?v=14',
    'reaction': 'laughing',
  },
  {
    'icon': 'https://linux.do/images/emoji/twemoji/open_mouth.png?v=14',
    'reaction': 'open_mouth',
  },
  {
    'icon': 'https://linux.do/images/emoji/twemoji/clap.png?v=14',
    'reaction': 'clap',
  },
  {
    'icon': 'https://linux.do/images/emoji/twemoji/confetti_ball.png?v=14',
    'reaction': 'confetti_ball',
  },
  {
    'icon': 'https://linux.do/images/emoji/twemoji/hugs.png?v=14',
    'reaction': 'hugs',
  },
  {
    'icon': 'https://linux.do/uploads/default/original/3X/2/e/2e09f3a3c7b27eacbabe9e9614b06b88d5b06343.png?v=14',
    'reaction': 'tieba_087',
  },
] as const;

interface Props {
  id: string;
}

export default function Emotion({ id }: Props) {
  const runtime = useRuntime();
  const root = React.useRef<HTMLDivElement>(null);
  const [post, updatePost] = React.useState<PostDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);

  React.useEffect(() => {
    const ob = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        runtime.latestTopic.resolvePost(id).then(d => {
          updatePost(d ?? null);
        }).finally(() => {
          setLoading(false);
        })
      }
    });

    ob.observe(root.current!);

    return () => {
      ob.disconnect();
    };
  });

  const popupState = usePopupState({
    variant: 'popover',
  });

  const value = post?.current_user_reaction?.id;
  const reactionCount = post?.reactions ?? [];

  const getCount = (reaction: string) => {
    const r = reactionCount.find(d => d.id === reaction);
    return r?.count ?? 0;
  };

  const current = reactions.find(d => d.reaction === value);

  const handleReaction = async (reaction: string) => {
    popupState.close();
    if (!reaction || !post) return;
    setActionLoading(true);
    const newPost = await runtime.latestTopic.toggleLike(id, String(post.id), reaction);
    updatePost(newPost ?? null);
    setActionLoading(false);
  };

  return (
    <div ref={root} onClick={e => e.stopPropagation()}>
      {
        (loading || actionLoading) && (
          <Box
            display="flex"
            width={31}
            height={31}
            alignItems="center"
            justifyContent="center"
          >
            <CircularProgress size="20px" />
          </Box>
        )
      }
      {
        !loading && !actionLoading && (
          <IconButton
            {...bindHover(popupState)}
            onClick={() => handleReaction(current?.reaction ?? '')}
          >
            {
              current ? (
                <img width={20} height={20} src={current.icon} referrerPolicy="no-referrer" alt={current.reaction} />
              ) : (<FavoriteBorderIcon />)
            }
          </IconButton>
        )
      }
      <HoverPopover
        {...bindPopover(popupState)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Stack direction="row" spacing={2} sx={{ p: 1, pt: 4 }}>
          {
            reactions.map(reaction => (
              <IconButton
                key={reaction.reaction}
                disabled={current && (current.reaction !== reaction.reaction)}
                onClick={() => handleReaction(reaction.reaction)}
              >
                <img
                  style={{ opacity: current && (current.reaction !== reaction.reaction) ? 0.6 : 1 }} width={20}
                  height={20}
                  src={reaction.icon}
                  referrerPolicy="no-referrer"
                  alt={reaction.reaction}
                />
                <CartBadge badgeContent={getCount(reaction.reaction)} color="primary" overlap="circular" />
              </IconButton>
            ))
          }
        </Stack>
      </HoverPopover>
    </div>
  );
}
