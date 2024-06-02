import { observer } from 'mobx-react-lite';
import { Runtime } from '@src/core/runtime.ts';

import { TopicList } from './TopicList';

interface PopupProps {
  runtime: Runtime;
}

const Popup = ({ runtime }: PopupProps) => {
  return (
    <div className="Popup">
      <TopicList
        topics={runtime.latestTopic.export.topics}
        categories={runtime.categories.export.categories}
      />
    </div>
  );
};

export default Popup;


export const PopupView = observer(Popup);
