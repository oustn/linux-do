import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack'

import type { Category, Topic } from '@src/core/type';
import { avatarUrl, formatDate, formatNumber, handlerViewTopic } from '@src/utils';

import { CategoryTip } from './Category';
import { TopicOrder } from './TopicOrder.tsx';
import { LatestTopicOrder } from '@src/core/latest-topic.ts';

interface TopicListProps {
  topics: Array<Topic>;
  categories: Array<Category>;
  order: LatestTopicOrder;
  handleFetch: (order: LatestTopicOrder) => void;
  loading: boolean
}

function Partial({title, value}:{ title: string, value?: string | number }) {
  return (
    <Box
      lineHeight="1em"
      flexGrow={1}
      flexShrink={0}
      textAlign="center"
    >
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.primary"
        sx={{
          fontWeight: 'bold'
        }}
      >
        {value}
      </Typography>
    </Box>
  )
}

const FILTER: Array<{
  name: string;
  value: LatestTopicOrder;
  icon?: React.ReactNode;
}> = [
  {
    name: '默认',
    value: LatestTopicOrder.default,
  },
  {
    name: '最新',
    value: LatestTopicOrder.created,
  },
  {
    name: '活跃',
    value: LatestTopicOrder.activity,
  },
  {
    name: '浏览',
    value: LatestTopicOrder.views,
  },
  {
    name: '回复',
    value: LatestTopicOrder.posts,
  },
  {
    name: '分类',
    value: LatestTopicOrder.category,
  },
  {
    name: '点赞',
    value: LatestTopicOrder.likes,
  },
  {
    name: '原帖点赞',
    value: LatestTopicOrder.op_likes,
  },
  {
    name: '发帖人数',
    value: LatestTopicOrder.posters,
  },
];

export const TopicList = (props: TopicListProps) => {
  const { topics, categories, order, handleFetch, loading } = props;

  return (
    <Box
      minHeight="0"
      display="flex"
      flexDirection="column"
    >
      <Box
      >
        <TopicOrder
          orders={FILTER}
          value={order}
          onChange={(value) => handleFetch(value as LatestTopicOrder)}
          loading={loading}
        />
      </Box>
      <Box
        minHeight="0"
        flex="1"
        overflow="auto"
      >
        {
          !loading && (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {
                topics.map((topic, index) => (
                  <React.Fragment key={topic.id}>
                    <ListItem alignItems="flex-start" disablePadding>
                      <ListItemButton
                        onClick={() => handlerViewTopic(topic.id)}
                      >
                        <Box
                          alignSelf="flex-start"
                          paddingTop={1}
                          flex="0 0 56px"
                          display="flex"
                          alignItems="center"
                          flexDirection="column"
                          marginRight={2}
                        >
                          <ListItemAvatar
                            sx={{
                              minWidth: 'auto'
                            }}
                          >
                            <Avatar alt="Remy Sharp" src={avatarUrl(topic.author.avatar_template!)} />
                          </ListItemAvatar>
                          <Typography
                            sx={{
                              mt: 1
                            }}
                            variant="caption"
                            color="text.primary"
                          >
                            {topic.author.name || topic.author.username}
                          </Typography>
                        </Box>
                        <Box
                          flexGrow={1}
                          flexShrink={1}
                        >
                          <ListItemText
                            primary={topic.title}
                            secondary={
                              <React.Fragment>
                                <CategoryTip categories={categories} id={topic.category_id} />
                                <Typography
                                  sx={{ display: 'inline' }}
                                  component="span"
                                  variant="caption"
                                  color="secondary"
                                >
                                  {(topic as unknown as { tags: string[] }).tags.length ? ` · ${(topic as unknown as {
                                    tags: string[]
                                  }).tags.join(', ')}` : ''}
                                </Typography>
                              </React.Fragment>
                            }
                          />
                          <Stack
                            direction="row"
                            divider={<Divider orientation="vertical" flexItem />}
                          >
                            <Partial title="回复" value={formatNumber(topic.posts_count)} />
                            <Partial title="浏览量" value={formatNumber(topic.views)} />
                            <Partial title="活动" value={formatDate(topic.last_posted_at!)} />
                          </Stack>
                        </Box>
                      </ListItemButton>
                    </ListItem>
                    {
                      index < topics.length - 1 && <Divider variant="inset" component="li" />
                    }
                  </React.Fragment>
                ))
              }
            </List>
          )
        }
      </Box>
    </Box>
  );
};
