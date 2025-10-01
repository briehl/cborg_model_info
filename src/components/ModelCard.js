import './ModelCard.css';

const ModelCard = ({ model, onClick }) => {
  const modelInfo = model.model_info || {};
  const litellmParams = model.litellm_params || {};

  const getCapabilities = () => {
    const caps = [];
    if (modelInfo.supports_vision) caps.push('Vision');
    if (modelInfo.supports_function_calling) caps.push('Function Calling');
    if (modelInfo.supports_tool_choice) caps.push('Tool Choice');
    if (modelInfo.supports_audio_input) caps.push('Audio Input');
    if (modelInfo.supports_audio_output) caps.push('Audio Output');
    if (modelInfo.supports_reasoning) caps.push('Reasoning');
    if (modelInfo.supports_web_search) caps.push('Web Search');
    if (modelInfo.supports_computer_use) caps.push('Computer Use');
    if (modelInfo.supports_pdf_input) caps.push('PDF Input');
    if (modelInfo.supports_prompt_caching) caps.push('Prompt Caching');
    return caps.length > 0 ? caps.join(', ') : 'Standard Chat';
  };

  const formatCost = (inputCost, outputCost) => {
    const input = inputCost || modelInfo.input_cost_per_token || litellmParams.input_cost_per_token || 0;
    const output = outputCost || modelInfo.output_cost_per_token || litellmParams.output_cost_per_token || 0;

    if (input === 0 && output === 0) return 'Free';
    return `Input: $${input.toFixed(6)*1000000} / Output: $${output.toFixed(6)*1000000}`;
  };

  const hasToolUsage = () => {
    return modelInfo.supports_function_calling === true ||
           modelInfo.supports_tool_choice === true;
  };

  const getDescription = () => {
    if (modelInfo.litellm_provider) {
      return `Provider: ${modelInfo.litellm_provider}`;
    }
    return 'LLM Model';
  };

  const getMaxTokens = () => {
    const maxTokens = modelInfo.max_tokens || modelInfo.max_output_tokens;
    const maxInput = modelInfo.max_input_tokens;

    if (maxTokens && maxInput) {
      return `${maxInput.toLocaleString()} in / ${maxTokens.toLocaleString()} out`;
    } else if (maxTokens) {
      return maxTokens.toLocaleString();
    }
    return 'N/A';
  };

  return (
    <div className="model-card" onClick={onClick}>
      <div className="model-header">
        <h2 className="model-name">{model.model_name || 'Unnamed Model'}</h2>
        {hasToolUsage() && (
          <span className="tool-badge">Tool Usage</span>
        )}
      </div>

      <div className="model-description">
        <p>{getDescription()}</p>
      </div>

      <div className="model-details">
        <div className="detail-item">
          <strong>Capabilities:</strong>
          <span className="capabilities">{getCapabilities()}</span>
        </div>

        <div className="detail-item">
          <strong>Max Tokens:</strong>
          <span>{getMaxTokens()}</span>
        </div>

        <div className="detail-item">
          <strong>Cost per 10^6 Tokens:</strong>
          <span>{formatCost()}</span>
        </div>
      </div>

      <div className="model-footer">
        <span className="model-id">ID: {modelInfo.id || 'N/A'}</span>
      </div>
    </div>
  );
};

export default ModelCard;
