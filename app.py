import streamlit as st
import pandas as pd
import numpy as np

st.title("CSV to Lua Table Converter")
def to_lua_table(df, x_cols=None, y_col=None, filename=None):
    """Converts a Pandas DataFrame to Lua table strings for X (features) and y (target), 
       and optionally writes to a file.

    Args:
        df: The Pandas DataFrame.
        x_cols: A list of column names for the X (features) data. If None, all columns 
                except y_col are used.
        y_col: The name of the column for the y (target) data. If None, no y data is generated.
        filename (optional): The base filename (without extension).  If provided, 
                two files will be created: "filename_X.lua" and "filename_y.lua".

    Returns:
        If filename is None: A tuple containing the Lua table strings (X_lua, y_lua). y_lua will be None if y_col is None.
        If filename is provided: None.  Writes the Lua tables to files.
    """

    if x_cols is None:
        if y_col:
            x_cols = [col for col in df.columns if col != y_col]
        else:
            x_cols = df.columns.tolist()

    if not all(col in df.columns for col in x_cols):
        raise ValueError("Specified x_cols not found in DataFrame")
    if y_col and y_col not in df.columns:
      raise ValueError("y_col not found in DataFrame")

    X_lua = _lua_table_from_data(df[x_cols])


    y_lua = None
    if y_col:
        y_lua = _lua_table_from_data(df[[y_col]])  #wrap the column in a list for consistency

    if filename:
        try:

            with open(f"{filename}_X.lua", 'w') as f:
                f.write(X_lua)
            print(f"X Lua table written to {filename}_X.lua")

            if y_lua:

                with open(f"{filename}_y.lua", 'w') as f:
                    f.write(y_lua)

                print(f"y Lua table written to {filename}_y.lua")


        except Exception as e:
            print(f"Error writing to file: {e}")
        return None #explicitly specify to return None to avoid confusion

    else:
        return X_lua, y_lua



def _lua_table_from_data(df_subset):
    """helper function to convert dataframe to lua table. Used by to_lua_table"""
    lua_table = "local data = {\n"
    for _, row in df_subset.iterrows():
        lua_table += "  {"
        values = []
        for col in df_subset.columns:
            value = row[col]
            if pd.isna(value):
                values.append("nil")
            elif isinstance(value, (int, float, np.number)):
                values.append(str(value))
            elif isinstance(value, str):
                values.append(f'"{value}"')
            else:
                values.append(f'"{str(value)}"')  # Handle other types
        lua_table += ", ".join(values)
        lua_table += "},\n"

    lua_table += "}\n"
    return lua_table
uploaded_file = st.file_uploader("Choose a CSV file", type="csv")

if uploaded_file is not None:
    try:
        df = pd.read_csv(uploaded_file)
        st.write("Data preview:")
        st.dataframe(df.head())

        # Column selection
        selected_columns = st.multiselect("Select columns for X (features):", df.columns.tolist())

        if selected_columns:
            y_col = st.selectbox("Select column for y (target):", ['None'] + df.columns.tolist())
            if y_col == 'None':
                y_col = None

            if st.button('Convert'):
                if y_col:
                    X_lua, y_lua = to_lua_table(df, x_cols=selected_columns, y_col=y_col)
                    st.code(X_lua, language="lua")
                    st.code(y_lua, language="lua")
                else:
                    X_lua, _ = to_lua_table(df, x_cols=selected_columns)
                    st.code(X_lua, language="lua")

        else:
            st.warning("Please select at least one column for features (X)")

    except Exception as e:
        st.error(f"Error processing file: {e}")
else:
    st.info("Please upload a CSV file.")

