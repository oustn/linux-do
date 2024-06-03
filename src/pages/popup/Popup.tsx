import { observer } from 'mobx-react-lite';
import { Runtime } from '@src/core/runtime.ts';
import Box from '@mui/material/Box'

import { TopicList } from './TopicList';
import { AppBar } from './AppBar'

interface PopupProps {
  runtime: Runtime;
}

const Popup = ({ runtime }: PopupProps) => {
  return (
    <Box
      className="Popup"
      display="flex"
      flexDirection="column"
    >
      <AppBar/>
      <TopicList
        topics={runtime.latestTopic.export.topics}
        categories={runtime.categories.export.categories}
        order={runtime.latestTopic.export.order}
        handleFetch={(order) => runtime.latestTopic.fetch(order)}
        loading={runtime.latestTopic.export.loading || runtime.categories.export.loading}
      />
    </Box>
  );
};

export default Popup;


export const PopupView = observer(Popup);
