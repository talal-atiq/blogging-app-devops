import { createSlice } from '@reduxjs/toolkit';



const themeSlice = createSlice({
    name: 'themeSlice',
    
    initialState: {
        theme: 'light'
    },
    reducers: {
        changeTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light'
        }
    }
});
export const { changeTheme } = themeSlice.actions;
export default themeSlice.reducer;