const container = document.getElementById('collection-container');
const variablesEl = document.getElementById('variables');
let collection = null;
let variables = {};

function stripCurlies(value) {
  return value.replace(/\{\{(.+?)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
}

function formatRequestUrl(request) {
  if (request.url && request.url.raw) {
    return stripCurlies(request.url.raw);
  }
  if (request.url && request.url.path) {
    const path = request.url.path.join('/');
    const query = request.url.query?.map((param) => `${param.key}=${encodeURIComponent(stripCurlies(param.value || ''))}`).join('&');
    return `${stripCurlies(request.url.host?.join('.') || '')}/${path}${query ? `?${query}` : ''}`;
  }
  return '';
}

function valueForVariable(key) {
  return variables[key] || '';
}

function renderVariableField(variable) {
  const col = document.createElement('div');
  col.className = 'col-12 col-sm-6 col-lg-4';
  col.innerHTML = `
    <label class="form-label mb-1">${variable.key}</label>
    <input type="text" class="form-control variable-input" data-key="${variable.key}" value="${variable.value || ''}" readonly />
    <div class="form-text">${variable.description || ''}</div>
  `;
  variablesEl.appendChild(col);
}

function isListEndpoint(requestName) {
  const listKeywords = ['List', 'Search Available'];
  return listKeywords.some(keyword => requestName?.includes(keyword));
}

function renderRequest(item, groupId) {
  const wrapper = document.createElement('div');
  wrapper.className = 'card mb-3 card-request';

  const method = item.request.method || 'GET';
  const isListRequest = isListEndpoint(item.name);

  wrapper.innerHTML = `
    <div class="card-body">
      <div class="d-flex align-items-start justify-content-between gap-3 mb-2">
        <div>
          <h5 class="card-title mb-1">${item.name || item.request.url?.raw || method}</h5>
          <div class="request-meta text-muted">
            <span class="method-badge ${method.toLowerCase()}">${method}</span>
            <code>${formatRequestUrl(item.request)}</code>
          </div>
        </div>
        <button class="btn btn-sm btn-primary send-request">Send Request</button>
      </div>
      <div class="mb-3">
        <div class="form-text">${item.request.description || ''}</div>
      </div>
      <div class="response-container">
        <div class="response-box" data-response-for="${item.name || item.request.url?.raw}">Loading request response when sent...</div>
        ${isListRequest ? '<div class="load-more-container mt-3" style="display: none;"><button class="btn btn-sm btn-outline-primary load-more-btn">Load More</button></div>' : ''}
      </div>
    </div>
  `;

  const sendButton = wrapper.querySelector('.send-request');
  const responseBox = wrapper.querySelector('.response-box');
  const loadMoreContainer = wrapper.querySelector('.load-more-container');
  const loadMoreBtn = wrapper.querySelector('.load-more-btn');

  let currentData = null;
  let nextPageUri = null;
  let allRecords = [];

  async function fetchData(url) {
    const response = await fetch(url, { method });
    const contentType = response.headers.get('content-type') || '';
    const bodyText = await response.text();
    let output;

    if (contentType.includes('application/json')) {
      try {
        output = JSON.parse(bodyText);
      } catch {
        output = bodyText;
      }
    } else {
      try {
        output = JSON.parse(bodyText);
      } catch {
        output = bodyText;
      }
    }

    return output;
  }

  function displayData(data, append = false) {
    if (typeof data === 'object' && data !== null) {
      // Check if this is a paginated response
      const dataKeys = Object.keys(data);
      const collectionKey = dataKeys.find(key =>
        Array.isArray(data[key]) &&
        !['query', 'variable'].includes(key) &&
        key !== 'uri' &&
        key !== 'first_page_uri'
      );

      if (collectionKey && data.next_page_uri !== undefined) {
        // This is a paginated response
        const newRecords = data[collectionKey];

        if (append) {
          allRecords = [...allRecords, ...newRecords];
        } else {
          allRecords = newRecords;
        }

        // Create display data with accumulated records
        const displayData = {
          ...data,
          [collectionKey]: allRecords,
          _metadata: {
            current_page_count: newRecords.length,
            total_loaded: allRecords.length,
            has_more: !!data.next_page_uri
          }
        };

        responseBox.textContent = JSON.stringify(displayData, null, 2);

        // Show/hide load more button
        if (data.next_page_uri && isListRequest && loadMoreContainer) {
          nextPageUri = data.next_page_uri;
          loadMoreContainer.style.display = 'block';
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = `Load More (${allRecords.length} loaded)`;
        } else if (loadMoreContainer) {
          loadMoreContainer.style.display = 'none';
        }
      } else {
        responseBox.textContent = JSON.stringify(data, null, 2);
        if (loadMoreContainer) {
          loadMoreContainer.style.display = 'none';
        }
      }
    } else {
      responseBox.textContent = data;
      if (loadMoreContainer) {
        loadMoreContainer.style.display = 'none';
      }
    }
  }

  sendButton.addEventListener('click', async () => {
    responseBox.textContent = 'Sending request...';
    if (loadMoreContainer) {
      loadMoreContainer.style.display = 'none';
    }
    allRecords = [];
    nextPageUri = null;

    console.log('variables:', variables);
    try {
      const url = formatRequestUrl(item.request);
      console.log('Fetching URL:', url);

      const data = await fetchData(url);
      currentData = data;
      displayData(data, false);
    } catch (err) {
      responseBox.textContent = `Request failed: ${err.message}`;
      if (loadMoreContainer) {
        loadMoreContainer.style.display = 'none';
      }
    }
  });

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', async () => {
      if (!nextPageUri) return;

      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'Loading...';

      try {
        // Build the full URL from the next_page_uri
        const baseUrl = variables['baseUrl'] || window.location.origin;
        const fullUrl = nextPageUri.startsWith('http') ? nextPageUri : `${baseUrl}${nextPageUri}`;
        console.log('Loading more from:', fullUrl);

        const data = await fetchData(fullUrl);
        currentData = data;
        displayData(data, true);
      } catch (err) {
        responseBox.textContent += `\n\nLoad more failed: ${err.message}`;
        loadMoreContainer.style.display = 'none';
      }
    });
  }

  return wrapper;
}

function renderFolder(item, parentEl) {
  if (item.item) {
    const section = document.createElement('div');
    section.className = 'mb-4';
    section.innerHTML = `
      <div class="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h3 class="h5 mb-1">${item.name}</h3>
          <p class="text-muted mb-0">${item.description || ''}</p>
        </div>
      </div>
    `;

    parentEl.appendChild(section);
    item.item.forEach((child) => renderFolder(child, parentEl));
    return;
  }

  const requestCard = renderRequest(item);
  parentEl.appendChild(requestCard);
}

function init() {
  fetch('/collection.json')
    .then((res) => res.json())
    .then((data) => {
      collection = data;
      variables = Object.fromEntries((collection.variable || []).map((variable) => [variable.key, variable.value || '']));
      variables['baseUrl'] = variables['baseUrl'] || window.location.origin;
      
      if (variablesEl) {
        variablesEl.innerHTML = '';
        (collection.variable || []).forEach(renderVariableField);

        variablesEl.addEventListener('input', (event) => {
          const input = event.target.closest('input[data-key]');
          if (input) {
            variables[input.dataset.key] = input.value;
          }
        });
      }

      const pageFilter = document.body.getAttribute('data-page');
      const filteredItems = pageFilter ? (collection.item || []).filter((item) => item.name.includes(pageFilter)) : [];

      if (filteredItems.length > 0) {
        const title = document.createElement('div');
        title.className = 'mb-3';
        title.innerHTML = `<strong>Collection:</strong> ${collection.info?.name || 'Untitled'}`;
        container.appendChild(title);
      }

      filteredItems.forEach((item) => renderFolder(item, container));
    })
    .catch((error) => {
      container.innerHTML = `<div class="alert alert-danger">Unable to load the collection: ${error.message}</div>`;
    });
}

init();
