// import { FcGoogle } from "react-icons/fc";
// import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth'
// import { app } from '../firebase/firebaseConfig';
// import axios from 'axios';
// import { loginStart, loginSuccess, loginFailure } from '../features/userSlice'
// import { useDispatch } from 'react-redux';
// import { Navigate, useNavigate } from 'react-router-dom';









// const OAuth = () => {


//     const auth = getAuth(app);
//     const dispatch = useDispatch();
//     const navigate = useNavigate();


//     const googleFirebaseAuthBtn = async () => {

//         const googleProvider = new GoogleAuthProvider();
//         googleProvider.setCustomParameters({ prompt: 'select_account' });

//         try {
//             const googleSignIn = await signInWithPopup(auth, googleProvider);
//             const { user } = googleSignIn;

//             const userData = {
//                 username: user.displayName,
//                 email: user.email,
//                 profilePicture: user.photoURL
//             }

//             dispatch(loginStart());
//             const addGoogleUser = await axios.post('/api/user/googleuser', userData);
//             if (addGoogleUser.data.user) {
//                 dispatch(loginSuccess(addGoogleUser.data.user));
//                 navigate('/');
//             }

//         } catch (error) {
//             dispatch(loginFailure(error));
//             console.log(error);
//         }

//     }




//     return (
//         <>
//             <div className="">
//                 <button type="button" className=" border border-orange-500 flex items-center justify-center gap-2 active:scale-x-95 rounded-md w-full py-2 transition-all" onClick={googleFirebaseAuthBtn}>
//                     <FcGoogle size={20} />
//                     <span>Continue with google</span>
//                 </button>
//             </div>
//         </>
//     )
// }
// export default OAuth;
export default function OAuth() {
  return null; // Disabled temporarily
}
