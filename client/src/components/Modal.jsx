import { IoClose } from "react-icons/io5";
import { ImWarning } from "react-icons/im";
import axios from "axios";
import { deleteUserStart, deleteUserSuccess, deleteUserFailure, } from "../features/userSlice";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";




const Modal = ({ setShowModal, user }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();


    const closeModal = () => {
        setShowModal(false)
    }

    const cancelHandle = () => {
        setShowModal(false)
    }

    const deleteUser = async () => {

        try {
            dispatch(deleteUserStart());
            const deleteUserInfo = await axios.delete(`/api/user/deleteuser/${user._id}`, {

                data: {
                    user: user
                },
                headers: {
                    Authorization: user.token
                }
            })
            dispatch(deleteUserSuccess());

        } catch (error) {
            toast.error('An error occurred while deleting user!');
            dispatch(deleteUserFailure(error));
        }
    }





    return (
        <>
            <div className="fixed inset-0  transition-all backdrop-blur-sm bg-opacity-30 flex justify-center items-center">

                <div className="flex flex-col gap-7 bg-slate-600 shadow-md w-80 md:w-96 bg- rounded-md  px-3 justify-center items-center py-5">

                    <button className="place-self-end " onClick={closeModal}>
                        <IoClose size={25} color="white" />
                    </button>

                    <div className="">
                        <ImWarning size={40} color="white" />
                    </div>

                    <div className="">
                        <p className="text-xl text-center text-white">Are you sure you want to delete your account ?</p>
                    </div>

                    <div className="flex gap-4">
                        <button className="bg-red-500 text-white rounded-sm transition-all active:bg-red-600 font-semibold py-2 px-3 active:scale-95" onClick={deleteUser}>Yes,I'm sure</button>
                        <button className=" border font-semibold text-white active:scale-95 transition-all bg-transparent rounded-sm py-2 px-3" onClick={cancelHandle}>No, cancel</button>
                    </div>


                </div>



            </div>
        </>
    )
}
export default Modal;