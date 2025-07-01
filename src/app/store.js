import { configureStore } from '@reduxjs/toolkit'
import counterReducer from "../features/Counter/counterSlice"
import themeReducer from "../features/theme/themeSlice"
import editorReducer from "../features/editor/editorSlice"

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    theme: themeReducer,
    editor: editorReducer,
  },
})