import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';


import type { Topic, Category } from '@src/core/type';
import { avatarUrl, handlerViewTopic } from '@src/utils';

import { CategoryTip } from './Category';
import ListItemButton from '@mui/material/ListItemButton';

interface TopicListProps {
  topics: Array<Topic>;
  categories: Array<Category>;
}

export const TopicList = (props: TopicListProps) => {
  const { topics, categories } = props;

  return (
    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      {
        topics.map((topic, index) => (
          <React.Fragment key={topic.id}>
            <ListItem alignItems="flex-start" disablePadding>
              <ListItemButton
                onClick={() => handlerViewTopic(topic.id)}
              >
                <ListItemAvatar>
                  <Avatar alt="Remy Sharp" src={avatarUrl(topic.author.avatar_template!)} />
                </ListItemAvatar>
                <ListItemText
                  primary={topic.fancy_title}
                  secondary={
                    <React.Fragment>
                      <CategoryTip categories={categories} id={topic.category_id} />
                      {(topic as unknown as { tags: string[] }).tags.length ? ` · ${(topic as unknown as { tags: string[] }).tags.join(', ')}` : ''}
                    </React.Fragment>
                  }
                />
              </ListItemButton>
            </ListItem>
            {
              index < topics.length - 1 && <Divider variant="inset" component="li" />
            }
          </React.Fragment>
        ))
      }
    </List>
  );
};
