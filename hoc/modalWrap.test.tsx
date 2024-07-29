import ModalWrap, { ModalFCProps } from "./modalWrap"

interface Iprops extends ModalFCProps {
    data: string
}

const RawModal = ModalWrap((props: Iprops ) => {
    return <></>
})

// function RawModal(props: Iprops ){
//     return <></>
// }


export default RawModal;

RawModal.open({
    data: "123"
})