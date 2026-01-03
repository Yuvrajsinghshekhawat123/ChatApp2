import { createSlice } from "@reduxjs/toolkit"

const initialState={
    activeTab:"all",
}


const activeSlice=createSlice({
    name: "active",
    initialState,
    reducers:{
        setActiveTab:(state,action)=>{
            state.activeTab=action.payload;
        },
        resetActiveTab:(state)=>{
            state.activeTab="all";
        }
    }
})

export const {setActiveTab,resetActiveTab}=activeSlice.actions;
export default activeSlice.reducer;
