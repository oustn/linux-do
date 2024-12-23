import React from 'react';
import { observer } from 'mobx-react-lite';
import { Runtime } from '@src/core/runtime.ts';
import Box from '@mui/material/Box';

import { TopicList } from './TopicList';
import { AppBar } from './AppBar';

interface PopupProps {
  runtime: Runtime | null;
}

const Popup = ({ runtime }: PopupProps) => {
  return (
    <Box
      className="Popup"
      display="flex"
      flexDirection="column"
    >
      {
        runtime && (
          <React.Fragment>
            <AppBar
              isLogin={runtime.user.export.isLogin}
              userBasic={runtime.user.export.basic}
              userSummary={runtime.user.export.summary}
              unreadNotification={runtime.user.export.unreadNotification}
              unreadPrivateMessage={runtime.user.export.unreadPrivateMessage}
            />
            <TopicList
              topics={runtime.latestTopic.export.topics}
              categories={runtime.categories.export.categories}
              order={runtime.latestTopic.export.order}
              handleFetch={(order) => runtime.latestTopic.fetch(order)}
              loading={runtime.latestTopic.export.loading || runtime.categories.export.loading}
            />
          </React.Fragment>
        )
      }
    </Box>
  );
};

export default Popup;


export const PopupView = observer(Popup);
