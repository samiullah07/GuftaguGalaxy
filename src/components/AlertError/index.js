import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const showSwal = (title, text) => {
  withReactContent(Swal).fire({
    icon: "error",
    title: title,
    text: text,
  });
};

export default showSwal;
