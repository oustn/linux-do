import {observer} from "mobx-react-lite"

const Popup = () => {
  return (
    <div className="Popup">
      hello world
    </div>
  );
};

export default Popup;


export const PopupView = observer(Popup)
