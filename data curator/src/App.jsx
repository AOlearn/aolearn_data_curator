import { useState } from "react";
import Papa from "papaparse";
import './App.css';

function App() {
  const [csvData, setCsvData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [xColumns, setXColumns] = useState([]);
  const [yColumn, setYColumn] = useState("");
  const [model, setModel] = useState("linear_regression");
  const [learningRate, setLearningRate] = useState(0.01);
  const [iterations, setIterations] = useState(1000);
  const [regularization, setRegularization] = useState(0.1);
  const [kValue, setKValue] = useState(3);
  const [numClasses, setNumClasses] = useState(2);
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const [header, ...data] = results.data;
        setColumns(header);
        setCsvData(data);
      },
      header: false,
      skipEmptyLines: true,
    });
  };

  const generateLuaCode = () => {
    if (!xColumns.length || !yColumn) {
      alert("Please select X and Y columns");
      return "";
    }
  
    let selectedXData = csvData.map((row) =>
      xColumns.map((col) => Number(row[columns.indexOf(col)]))
    );
    let selectedYData = csvData.map((row) => Number(row[columns.indexOf(yColumn)]));
  
    const luaX = selectedXData.map((row) => `{ ${row.join(", ")} }`).join(",\n  ");
    const luaY = selectedYData.join(", ");
    const sampleData = selectedXData[0] || [];
  
    let luaCode = `
  AOlearn=require("aolearn")
  local X = {
    ${luaX}
  }
  local y = { ${luaY} }
    `;
  
    switch (model) {
      case "linear_regression":
        luaCode += `
  -- Linear Regression
  local theta = AOlearn.linear_regression.fit_linear(X, y, ${learningRate}, ${iterations})
  print({"Linear Regression Coefficients:", table.unpack(theta)})
  local prediction = AOlearn.linear_regression.predict_linear(theta, {${sampleData.join(", ")}})
  print({"Linear Regression Prediction for {${sampleData.join(", ")}}:", prediction})
        `;
        break;
      case "logistic_regression":
        luaCode += `
  -- Logistic Regression
  local weights, bias = AOlearn.logistic.fit_logistic(X, y, ${learningRate}, ${iterations})
  print({"Logistic Regression Weights:", table.unpack(weights)})
  print({"Logistic Regression Bias:", bias})
  local logistic_prediction = AOlearn.logistic.predict_logistic_sigmoid(weights, bias, {${sampleData.join(", ")}})
  print({"Logistic Regression Prediction for {${sampleData.join(", ")}}:", logistic_prediction})
        `;
        break;
      case "lasso_regression":
        luaCode += `
  -- Lasso Regression
  local theta_lasso = AOlearn.lasso.fit_lasso(X, y, ${regularization}, ${learningRate}, ${iterations})
  print({"Lasso Regression Coefficients:", table.unpack(theta_lasso)})
  local lasso_prediction = AOlearn.lasso.predict_lasso(theta_lasso, {${sampleData.join(", ")}})
  print({"Lasso Regression Prediction for {${sampleData.join(", ")}}:", lasso_prediction})
        `;
        break;
      case "ridge_regression":
        luaCode += `
  -- Ridge Regression
  local theta_ridge = AOlearn.ridge.fit_ridge(X, y, ${regularization}, ${learningRate}, ${iterations})
  print({"Ridge Regression Coefficients:", table.unpack(theta_ridge)})
  local ridge_prediction = AOlearn.ridge.predict_ridge(theta_ridge, {${sampleData.join(", ")}})
  print({"Ridge Regression Prediction for {${sampleData.join(", ")}}:", ridge_prediction})
        `;
        break;
      case "multiclass_logistic":
        luaCode += `
  -- Multiclass Logistic Regression
  local weights_multiclass, bias_multiclass = AOlearn.multiclass_logistic.fit_multiclass_logistic(X, y, ${numClasses}, ${learningRate}, ${iterations})
  print({"Multiclass Logistic Regression Weights:", weights_multiclass})
  print({"Multiclass Logistic Regression Bias:", bias_multiclass})
  local multiclass_prediction = AOlearn.multiclass_logistic.predict_multiclass_logistic(weights_multiclass, bias_multiclass, {${sampleData.join(", ")}})
  print({"Multiclass Logistic Regression Prediction for {${sampleData.join(", ")}}:", multiclass_prediction})
        `;
        break;
      case "naive_bayes":
        luaCode += `
  -- Naive Bayes
  local classProbabilities, featureProbabilities = AOlearn.naive_bayes.fit_naive_bayes(X, y)
  print({"Naive Bayes Class Probabilities:", classProbabilities})
  print({"Naive Bayes Feature Probabilities:", featureProbabilities})
  local naive_bayes_prediction = AOlearn.naive_bayes.predict_naive_bayes(classProbabilities, featureProbabilities, {${sampleData.join(", ")}})
  print({"Naive Bayes Prediction for {${sampleData.join(", ")}}:", naive_bayes_prediction})
        `;
        break;
      case "knn":
        luaCode += `
  -- K-Nearest Neighbors
  local knn_prediction = AOlearn.knn.predict_knn(X, y, ${kValue}, {${sampleData.join(", ")}})
  print({"K-Nearest Neighbors Prediction for {${sampleData.join(", ")}}:", knn_prediction})
        `;
        break;
      case "kmeans":
        luaCode += `
  -- K-Means Clustering
  local centroids = AOlearn.clustering.fit_kmeans(X, ${numClasses}, ${iterations})
  print({"K-Means Clustering Centroids:", centroids})
        `;
        break;
      default:
        break;
    }
  
    return luaCode;
  };

  const renderModelOptions = () => {
    switch (model) {
      case "linear_regression":
      case "logistic_regression":
      case "lasso_regression":
      case "ridge_regression":
      case "multiclass_logistic":
        return (
          <>
            <label className="label">Learning Rate:</label>
            <input
              type="number"
              value={learningRate}
              onChange={(e) => setLearningRate(e.target.value)}
              className="input"
            />

            <label className="label">Iterations:</label>
            <input
              type="number"
              value={iterations}
              onChange={(e) => setIterations(e.target.value)}
              className="input"
            />

            {(model === "lasso_regression" || model === "ridge_regression") && (
              <>
                <label className="label">Regularization:</label>
                <input
                  type="number"
                  value={regularization}
                  onChange={(e) => setRegularization(e.target.value)}
                  className="input"
                />
              </>
            )}

            {model === "multiclass_logistic" && (
              <>
                <label className="label">Number of Classes:</label>
                <input
                  type="number"
                  value={numClasses}
                  onChange={(e) => setNumClasses(e.target.value)}
                  className="input"
                />
              </>
            )}
          </>
        );
      case "knn":
        return (
          <>
            <label className="label">K Value:</label>
            <input
              type="number"
              value={kValue}
              onChange={(e) => setKValue(e.target.value)}
              className="input"
            />
          </>
        );
      case "kmeans":
        return (
          <>
            <label className="label">Number of Clusters:</label>
            <input
              type="number"
              value={numClasses}
              onChange={(e) => setNumClasses(e.target.value)}
              className="input"
            />

            <label className="label">Iterations:</label>
            <input
              type="number"
              value={iterations}
              onChange={(e) => setIterations(e.target.value)}
              className="input"
            />
          </>
        );
      default:
        return null;
    }
  };

  const copyToClipboard = () => {
    const luaCode = generateLuaCode();
    navigator.clipboard.writeText(luaCode);
  };

  return (
    <div className="app-layout">
      <div className="app-container">
        <div className="header">
          <div className="logo">
            <svg viewBox="0 0 24 24" className="globe-icon">
              <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M12 4C14.7614 4 17 8.02944 17 13C17 17.9706 14.7614 22 12 22C9.23858 22 7 17.9706 7 13C7 8.02944 9.23858 4 12 4Z" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M4 12H20" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span>AO | <span className="learn-text">Learn</span></span>
          </div>
          <h1 className="app-title">Data Curator</h1>
        </div>
        
        <div className="tool-container" style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          gap: '20px',
          flexWrap: 'wrap' 
        }}>
          <div className="form-container" style={{ 
            flex: '1', 
            minWidth: '300px' 
          }}>
            <h2 className="section-title">Upload & Generate</h2>
            <p className="section-description">Upload your CSV data and generate Lua code for machine learning models</p>
            
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="file-input"
            />

            <label className="label">Select Features (X):</label>
            <select
              multiple
              onChange={(e) =>
                setXColumns([...e.target.selectedOptions].map((opt) => opt.value))
              }
              className="select"
            >
              {columns.map((col, index) => (
                <option key={index} value={col}>
                  {col}
                </option>
              ))}
            </select>

            <label className="label">Select Target (Y):</label>
            <select
              onChange={(e) => setYColumn(e.target.value)}
              className="select"
            >
              <option value="">Select Y</option>
              {columns.map((col, index) => (
                <option key={index} value={col}>
                  {col}
                </option>
              ))}
            </select>

            <label className="label">Select Model:</label>
            <select
              onChange={(e) => setModel(e.target.value)}
              className="select"
            >
              <option value="linear_regression">Linear Regression</option>
              <option value="logistic_regression">Logistic Regression</option>
              <option value="lasso_regression">Lasso Regression</option>
              <option value="ridge_regression">Ridge Regression</option>
              <option value="multiclass_logistic">Multiclass Logistic Regression</option>
              <option value="naive_bayes">Naive Bayes</option>
              <option value="knn">K-Nearest Neighbors</option>
              <option value="kmeans">K-Means Clustering</option>
            </select>

            {renderModelOptions()}

            <div className="button-group">
              <button
                onClick={() =>
                  document.getElementById("luaOutput").textContent = generateLuaCode()
                }
                className="btn-generate"
              >
                Generate Lua Code
              </button>
              <button
                onClick={copyToClipboard}
                className="btn-copy"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>

          <div className="code-output-container" style={{ 
            flex: '1', 
            minWidth: '300px' 
          }}>
            <div className="code-window">
              <div className="window-controls">
                <span className="control red"></span>
                <span className="control yellow"></span>
                <span className="control green"></span>
                <div className="window-title">Generated Lua Code</div>
              </div>
              <pre
                id="luaOutput"
                className="code-output"
              ></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
