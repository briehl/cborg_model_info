import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import './App.css';
import ModelCard from './components/ModelCard';
import SearchFilter from './components/SearchFilter';
import Modal from './components/Modal';

function App() {
  const [apiKey, setApiKeyState] = useState('');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCapability, setFilterCapability] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name-asc');
  const [keyInfo, setKeyInfo] = useState({ maxBudget: null, spend: null });

  const apiKeyInputRef = useRef(null);

  // Wrapper function to save API key to localStorage
  const setApiKey = (key) => {
    setApiKeyState(key);
    if (key) {
      localStorage.setItem('cborgApiKey', key);
    } else {
      localStorage.removeItem('cborgApiKey');
    }
  };

  // Load API key from localStorage on app mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('cborgApiKey');
    if (savedApiKey) {
      setApiKeyState(savedApiKey);
    }
  }, []);

  const fetchModels = useCallback(async () => {
    if (!apiKey) {
      setError('Please enter an API key');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.cborg.lbl.gov/model/info', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.data && Array.isArray(result.data)) {
        const uniqueModels = filterDuplicates(result.data);
        setModels(uniqueModels);
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err) {
      setError(`Failed to fetch models: ${err.message}`);
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  // Fetch models when API key is loaded from localStorage
  useEffect(() => {
    if (apiKey && !isAuthenticated) {
      fetchModels();
    }
  }, [apiKey, fetchModels, isAuthenticated]);

  const fetchKeyInfo = useCallback(async (key) => {
    try {
      const response = await fetch('https://api.cborg.lbl.gov/key/info', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return;

      const resp = await response.json();
      const maxBudget = resp?.info?.max_budget ?? null;
      const spend = resp?.info?.spend ?? null;
      setKeyInfo({ maxBudget, spend });
    } catch {
      // Non-fatal: silently ignore if key info fetch fails
    }
  }, []);

  // Fetch key info whenever the user authenticates or changes their API key
  useEffect(() => {
    if (isAuthenticated && apiKey) {
      fetchKeyInfo(apiKey);
    } else {
      setKeyInfo({ maxBudget: null, spend: null });
    }
  }, [isAuthenticated, apiKey, fetchKeyInfo]);

  const filterDuplicates = (modelList) => {
    const uniqueMap = new Map();

    modelList.forEach(model => {
      const id = model?.model_info?.id;
      if (id && !uniqueMap.has(id)) {
        uniqueMap.set(id, model);
      }
    });

    return Array.from(uniqueMap.values());
  };

  const filteredModels = useMemo(() => {
    let filtered = models;

    if (searchTerm) {
      filtered = filtered.filter(model => {
        const modelName = model.model_name || '';
        const key = model.model_info?.key || '';
        return modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               key.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (filterCapability !== 'all') {
      filtered = filtered.filter(model => {
        const modelInfo = model.model_info || {};
        if (filterCapability === 'tools') {
          return modelInfo.supports_function_calling === true ||
                 modelInfo.supports_tool_choice === true;
        }
        if (filterCapability === 'vision') {
          return modelInfo.supports_vision === true;
        }
        if (filterCapability === 'audio') {
          return modelInfo.supports_audio_input === true ||
                 modelInfo.supports_audio_output === true;
        }
        if (filterCapability === 'reasoning') {
          return modelInfo.supports_reasoning === true;
        }
        return false;
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.model_name || '').localeCompare(b.model_name || '');
        case 'name-desc':
          return (b.model_name || '').localeCompare(a.model_name || '');
        case 'cost-asc': {
          const costA = (a.model_info?.input_cost_per_token || a.litellm_params?.input_cost_per_token || 0) +
                       (a.model_info?.output_cost_per_token || a.litellm_params?.output_cost_per_token || 0);
          const costB = (b.model_info?.input_cost_per_token || b.litellm_params?.input_cost_per_token || 0) +
                       (b.model_info?.output_cost_per_token || b.litellm_params?.output_cost_per_token || 0);
          return costA - costB;
        }
        case 'cost-desc': {
          const costA = (a.model_info?.input_cost_per_token || a.litellm_params?.input_cost_per_token || 0) +
                       (a.model_info?.output_cost_per_token || a.litellm_params?.output_cost_per_token || 0);
          const costB = (b.model_info?.input_cost_per_token || b.litellm_params?.input_cost_per_token || 0) +
                       (b.model_info?.output_cost_per_token || b.litellm_params?.output_cost_per_token || 0);
          return costB - costA;
        }
        default:
          return 0;
      }
    });

    return sorted;
  }, [models, searchTerm, filterCapability, sortBy]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const keyFromInput = apiKeyInputRef.current.value;
    setApiKey(keyFromInput);
  };

  const handleModelClick = (model) => {
    setSelectedModel(model);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedModel(null);
  };

  if (!isAuthenticated && !apiKey) {
    return (
      <div className="app">
        <div className="auth-container">
          <h1>LLM Model Cards Viewer</h1>
          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="api-key">Enter your CBORG API Key:</label>
            <input
              ref={apiKeyInputRef}
              id="api-key"
              type="password"
              defaultValue={apiKey}
              placeholder="Your API key"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Load Models'}
            </button>
            {error && <div className="error">{error}</div>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>LLM Model Cards</h1>
        {keyInfo.spend !== null && (
          <div className="key-credits">
            <span className="key-credits-label">Credits</span>
            {keyInfo.maxBudget !== null ? (
              <>
                <span className="key-credits-value">
                  ${(keyInfo.maxBudget - keyInfo.spend).toFixed(2)} remaining
                </span>
                <span className="key-credits-total">
                  of ${keyInfo.maxBudget.toFixed(2)} total
                </span>
              </>
            ) : (
              <span className="key-credits-value">
                ${keyInfo.spend.toFixed(2)} spent
              </span>
            )}
          </div>
        )}
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem('cborgApiKey');
            setApiKeyState('');
            setModels([]);
            setIsAuthenticated(false);
          }}
        >
          Change API Key
        </button>
      </header>

      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCapability={filterCapability}
        setFilterCapability={setFilterCapability}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {loading && <div className="loading">Loading models...</div>}
      {error && <div className="error">{error}</div>}

      <div className="models-grid">
        {filteredModels.length > 0 ? (
          filteredModels.map(model => (
            <ModelCard
              key={model.model_info?.id || model.model_name}
              model={model}
              onClick={() => handleModelClick(model)}
            />
          ))
        ) : (
          !loading && <div className="no-models">No models found matching your criteria</div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        modelData={selectedModel}
      />
    </div>
  );
}

export default App;
