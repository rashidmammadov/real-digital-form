/**
 * @description Defines the custom elements name as global.
 * @type {string}
 */
const REAL_DIGITAL_FORM = 'real-digital-form';
const REAL_DIGITAL_TEXTFILE = 'real-digital-textfield';
const REAL_DIGITAL_BUTTON = 'real-digital-button';

class RealDigitalForm extends HTMLElement {

	/**
	 * @description Observed parameters passed by attributes.
	 * @type {[string, string]}
	 */
	static observedAttributes = ['action', 'method'];

	/**
	 * @description Set up default formGroup parameter to holds custom form variables.
	 */
  	constructor() {
		super();
		this.formGroup = ({
			'action': null,
			'method': null,
			'fields': {},
			'loading': false
		});
  	}

	/**
	 * @description Tracks the value of observable attributes to append formGroup parameter.
	 * @param {string} key - the name of attributes.
	 * @param {any} oldValue - the previous value of changed attribute.
	 * @param {any} newValue - the current value of changed attribute.
	 */
	attributeChangedCallback(key, oldValue, newValue) {
		this.formGroup[key] = newValue;
	}

	/**
	 * @description Appends custom image element to the top of the form element when the element created on the browser.
	 */
	connectedCallback() {
		this.imageElement = this.createImageElement();
		this.insertBefore(this.imageElement, this.firstChild);
	}

	/**
	 * @description Appends custom img element with the real.digital logo.
	 * @returns {HTMLImageElement}
	 */
	createImageElement() {
		let imageElement = document.createElement('img');
		imageElement.setAttribute('src', 'https://www.real-digital.de/wp-content/uploads/real-digital_logo.svg');
		imageElement.setAttribute('alt', 'Real Digital Logo');
		return imageElement;
	}

	/**
	 * @description Checks all input if the form is valid then triggers error enable or disabled due to validation status.
	 * @returns {boolean}
	 */
	isFormValid() {
  		let valid = true;
  		let fields = this.formGroup.fields;
		fields && Object.keys(fields).forEach((key) => {
			if (!fields[key].isValid) {
				valid = false;
				document.querySelector(REAL_DIGITAL_TEXTFILE + '[name=' + key + ']').setAttribute('error', true);
			} else {
				document.querySelector(REAL_DIGITAL_TEXTFILE + '[name=' + key + ']').removeAttribute('error');
			}
		});
		return valid;
	}

	/**
	 * @description Checks the form validation and loading status to send HTTP request with data of the form.
	 */
  	submit() {
  		if (this.isFormValid() && !this.formGroup.loading) {
			this.sendHTTPRequest();
		}
  	}

	/**
	 * @description Sends the HTTP request with given parameters, action and method.
	 *		Then appends the result of a response to the div element with id attribute is result.
	 */
	sendHTTPRequest() {
		let xhr = new XMLHttpRequest();
		let url = `http://httpbin.org${this.formGroup.action}`;
		let data;
		if (this.formGroup.method.toLowerCase() === 'get') {
			url = url + `?${this.prepareRequestData(this.formGroup.method).join('&')}`;
		} else {
			data = JSON.stringify(this.prepareRequestData(this.formGroup.method));
		}
		xhr.parent = this;
		xhr.open(this.formGroup.method, url, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onreadystatechange = function () {
			let resultElement = document.getElementById('result');
			this.parent.loaded();
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 400) {
					if (resultElement) {
						resultElement.className = 'success';
						resultElement.innerHTML = 'Success response result.';
					}
				} else {
					if (resultElement) {
						resultElement.className = 'error';
						resultElement.innerHTML = 'Something went wrong with response.';
					}
				}
			}
		};
		this.loading();
		xhr.send(data);
	}

	/**
	 * @description Prepares the data of HTTP request by input values.
	 * @param {string} method - the method name of HTTP request.
	 * @returns {{} || []}
	 */
	prepareRequestData(method) {
  		let data = (method.toLowerCase() === 'get') ? [] : {};
		let fields = this.formGroup.fields;
		fields && Object.keys(fields).forEach((key) => {
			if (fields[key].value) {
				if (method.toLowerCase() === 'get') {
					data.push(`${key}=${encodeURIComponent(fields[key].value)}`);
				} else {
					data[key] = fields[key].value;
				}
			}
		})
		return data;
	}

	/**
	 * @description Disable the submit button and activates the loading status.
	 */
	loading() {
		document.querySelector(REAL_DIGITAL_BUTTON).setAttribute('disabled', true);
		this.formGroup.loading = true;
	}

	/**
	 * @description Enable the submit button and deactivates the loading status.
	 */
	loaded() {
		document.querySelector(REAL_DIGITAL_BUTTON).removeAttribute('disabled');
		this.formGroup.loading = false;
	}

}

class RealDigitalTextfield extends HTMLElement {

	/**
	 * @description Observed parameters passed by attributes.
	 * @type {[string, string, string]}
	 */
	static observedAttributes = ['name', 'validation', 'error'];

	/**
	 * @description Element to holds the error of input element.
	 */
	errorElement;

	/**
	 * @description Set up default formController, name and validation parameters.
	 */
  	constructor() {
		super();
		this.formController = ({
			'name': null,
			'validation': null,
			'isValid': false,
			'value': null
		});
		this._name = null;
		this._validation = null;
  	}

	/**
	 * @description Tracks the value of observable attributes to append show error of input or set value of attributes.
	 * @param {string} key - the name of attributes.
	 * @param {any} oldValue - the previous value of changed attribute.
	 * @param {any} newValue - the current value of changed attribute.
	 */
	attributeChangedCallback(key, oldValue, newValue) {
  		if (key === 'error') {
			newValue && this.showInputError();
		} else {
			this[key] = newValue;
		}
	}

	/**
	 * @description Sets form controller keys, appends input and error elements to the custom text field element.
	 */
	connectedCallback() {
		this.addFieldKeys();
		this.inputElement = this.createInputElement();
		this.errorElement = this.createErrorElement();
		this.appendChild(this.inputElement);
		this.appendChild(this.errorElement);
	}

	/**
	 * @description Sets formController elements to bind parent formGroup object.
	 */
  	addFieldKeys() {
		this.formController.name = this.name;
		this.formController.validation = this.validation;
		this.formController.isValid = !this.validation;
		this.parentNode.formGroup.fields[this.name] = this.formController;
  	}

	/**
	 * @description Creates and input element with given restriction settings to append the custom text field element.
	 * 		And binds input to tracks changes of value and keyup to tracks clicks of element.
	 * @returns {HTMLInputElement}
	 */
	createInputElement() {
		let inputElement = document.createElement('input');
		inputElement.setAttribute('type', 'text');
		inputElement.setAttribute('placeholder', this.name);
		inputElement.setAttribute('name', this.name);
		inputElement.addEventListener('input', this.valueChangeListener);
		inputElement.addEventListener('keyup', this.enterListener);
		return inputElement;
  	}

	/**
	 * @description Creates the error viewer element to bind the custom text field element.
	 * @returns {HTMLParagraphElement}
	 */
	createErrorElement() {
		let errorElement = document.createElement('p');
		errorElement.classList.add('hide');
		return errorElement;
	}

	/**
	 * @description Listener to tracks the input value, also check if the value valid with given validation if exist.
	 * @param {object} e - The input element object.
	 */
  	valueChangeListener(e) {
	  	let value = e.target.value;
	  	this.parentNode.formController.value = value;
	  	if (this.parentNode.validation) {
	  		let match = value.match(new RegExp(this.parentNode.validation, 'i'));
	  		if (match && match[0] === value) {
				this.parentNode.hideInputError();
			} else {
				this.parentNode.showInputError();
			}
	  	}
  	}

	/**
	 * @description Listens to click of ENTER key to trigger submit of the form.
	 * @param {object} e - The key element object.
	 */
	enterListener(e) {
	  	if (e.keyCode === 13) {
		  	e.preventDefault();
		  	this.parentNode.parentNode.submit();
	  	}
  	}

	/**
	 * @description Hides error of input element if valid.
	 */
	hideInputError() {
		this.classList.remove('error');
		this.formController.isValid = true;
		this.errorElement.innerHTML = '';
		this.errorElement.classList.remove('show');
		this.errorElement.classList.add('hide');
	}

	/**
	 * @description Shows error of input element if invalid.
	 */
  	showInputError() {
		this.classList.add('error');
		this.formController.isValid = false;
		this.errorElement.innerHTML = 'Invalid input type.';
		this.errorElement.classList.remove('hide');
		this.errorElement.classList.add('show');
	}

  	get name() {
		return this._name;
  	}

  	set name(value) {
  		this._name = value;
  	}

  	get validation() {
  		return this._validation;
  	}

  	set validation(value) {
  		this._validation = value;
  	}
}

class RealDigitalButton extends HTMLElement {

	/**
	 * @description Constructor of RealDigitalButton element.
	 */
  	constructor() {
		super();
  	}

	/**
	 * @description Appends click listener event after element enables to trigger submit of the form.
	 */
	connectedCallback() {
  		this.addEventListener('click', () => {
			this.parentNode.submit();
		});
  	}

}

/**
 * @description Define custom real-digital-* elements.
 */
customElements.define(REAL_DIGITAL_FORM, RealDigitalForm);
customElements.define(REAL_DIGITAL_TEXTFILE, RealDigitalTextfield);
customElements.define(REAL_DIGITAL_BUTTON, RealDigitalButton);
