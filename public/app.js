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
    <input type="text" class="form-control variable-input" data-key="${variable.key}" value="${variable.value || ''}" ${variable.key === 'baseUrl' ? 'readonly' : ''} />
    <div class="form-text">${variable.description || ''}</div>
  `;
  variablesEl.appendChild(col);
}

function renderRequest(item, groupId) {
  const wrapper = document.createElement('div');
  wrapper.className = 'card mb-3 card-request';

  const method = item.request.method || 'GET';

  wrapper.innerHTML = `
    <div class="card-body">
      <div class="d-flex align-items-start justify-content-between gap-3 mb-2">
        <div>
          <h5 class="card-title mb-1">${item.name || item.request.url?.raw || method}</h5>
          <div class="request-meta text-muted">${method} <code>${formatRequestUrl(item.request)}</code></div>
        </div>
        <button class="btn btn-sm btn-primary send-request">Send</button>
      </div>
      <div class="mb-3">
        <div class="form-text">${item.request.description || ''}</div>
      </div>
      <div class="response-box" data-response-for="${item.name || item.request.url?.raw}">Loading request response when sent...</div>
    </div>
  `;

  const sendButton = wrapper.querySelector('.send-request');
  const responseBox = wrapper.querySelector('.response-box');

  sendButton.addEventListener('click', async () => {
    responseBox.textContent = 'Sending request...';
    console.log('variables:', variables);
    try {
      const url = formatRequestUrl(item.request);
      console.log('Fetching URL:', url);
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

      if (typeof output === 'object') {
        responseBox.textContent = JSON.stringify(output, null, 2);
      } else {
        responseBox.textContent = output;
      }
    } catch (err) {
      responseBox.textContent = `Request failed: ${err.message}`;
    }
  });

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
      variablesEl.innerHTML = '';
      (collection.variable || []).forEach(renderVariableField);

      variablesEl.addEventListener('input', (event) => {
        const input = event.target.closest('input[data-key]');
        if (input) {
          variables[input.dataset.key] = input.value;
        }
      });

      const title = document.createElement('div');
      title.className = 'mb-3';
      title.innerHTML = `<strong>Collection:</strong> ${collection.info?.name || 'Untitled'}`;
      container.appendChild(title);

      (collection.item || []).forEach((item) => renderFolder(item, container));
    })
    .catch((error) => {
      container.innerHTML = `<div class="alert alert-danger">Unable to load the collection: ${error.message}</div>`;
    });
}

init();
