import userSlice from '../features/userSlice';
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import persistReducer from 'redux-persist/es/persistReducer';
import themeSlice from '../features/themeSlice';
import blogSlice from '../features/blogSlice';


const persistConfig = {
    key: 'root',
    version: 1,
    storage
};


const reducer = combineReducers({
    userSliceApp: userSlice,
    themeSliceApp: themeSlice,
    blogSliceApp: blogSlice
})


const persistedReducer = persistReducer(persistConfig, reducer);



const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
});


export default store;