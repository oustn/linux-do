import {observer} from "mobx-react-lite"

const Option = () => {
  return (
    <div className="Option">
      hello world
    </div>
  );
};

export default Option;


export const OptionView = observer(Option)
