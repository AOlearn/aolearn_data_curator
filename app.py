import streamlit as st
import pandas as pd
import numpy as np
import io

st.title("CSV to Lua Table Converter")

def to_lua_table(df, x_cols=None, y_col=None):
    """Convert a Pandas DataFrame to Lua table format."""
    if x_cols is None:
        x_cols = df.columns.tolist() if not y_col else [col for col in df.columns if col != y_col]

    if not all(col in df.columns for col in x_cols):
        raise ValueError("Specified x_cols not found in DataFrame")
    if y_col and y_col not in df.columns:
        raise ValueError("y_col not found in DataFrame")

    def _lua_table_from_data(df_subset):
        """Convert a DataFrame subset to a Lua table format (X)."""
        lua_table = "local X = {\n"
        for _, row in df_subset.iterrows():
            values = []
            for col in df_subset.columns:
                value = row[col]
                if pd.isna(value):
                    values.append("nil")
                elif isinstance(value, (int, float, np.number)):
                    values.append(str(value))
                else:
                    values.append(f'"{value}"')
            lua_table += f"  {{{', '.join(values)}}},\n"
        lua_table += "}\nreturn X"
        return lua_table

    def _lua_flat_array(series):
        """Convert a single-column Pandas Series to a flat Lua array (y)."""
        values = []
        for value in series:
            if pd.isna(value):
                values.append("nil")
            elif isinstance(value, (int, float, np.number)):
                values.append(str(value))
            else:
                values.append(f'"{value}"')
        return f"local y = {{ {', '.join(values)} }}\nreturn y"

    X_lua = _lua_table_from_data(df[x_cols])
    y_lua = _lua_flat_array(df[y_col]) if y_col else None  # y as a flat array

    return X_lua, y_lua

# File upload
uploaded_file = st.file_uploader("Choose a CSV file", type="csv")

if uploaded_file:
    try:
        df = pd.read_csv(uploaded_file)
        st.write("Data preview:")
        st.dataframe(df.head())

        selected_columns = st.multiselect("Select columns for X (features):", df.columns.tolist())

        if selected_columns:
            y_col = st.selectbox("Select column for y (target):", ['None'] + df.columns.tolist())
            y_col = None if y_col == 'None' else y_col

            if st.button('Convert'):
                X_lua, y_lua = to_lua_table(df, x_cols=selected_columns, y_col=y_col)

                # Display Lua code
                st.subheader("Lua Table for X (Features)")
                st.code(X_lua, language="lua")

                x_download = io.BytesIO(X_lua.encode())
                st.download_button(label="Download X Lua Table", data=x_download, file_name="X.lua", mime="text/plain")

                if y_lua:
                    st.subheader("Lua Table for y (Target)")
                    st.code(y_lua, language="lua")

                    y_download = io.BytesIO(y_lua.encode())
                    st.download_button(label="Download y Lua Table", data=y_download, file_name="y.lua", mime="text/plain")
        else:
            st.warning("Please select at least one column for X (features).")
    except Exception as e:
        st.error(f"Error processing file: {e}")
else:
    st.info("Please upload a CSV file.")
