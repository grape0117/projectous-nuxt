/* Shivving (IE8 is not supported, but at least it won't look as awful)
/* ========================================================================== */

(function (document) {
	var
	head = document.head = document.getElementsByTagName('head')[0] || document.documentElement,
	elements = 'article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output picture progress section summary time video x'.split(' '),
	elementsLength = elements.length,
	elementsIndex = 0,
	element;

	while (elementsIndex < elementsLength) {
		element = document.createElement(elements[++elementsIndex]);
	}

	element.innerHTML = 'x<style>' +
		'article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}' +
		'audio[controls],canvas,video{display:inline-block}' +
		'[hidden],audio{display:none}' +
		'mark{background:#FF0;color:#000}' +
	'</style>';

	return head.insertBefore(element.lastChild, head.firstChild);
})(document);

/* Prototyping
/* ========================================================================== */

(function (window, ElementPrototype, ArrayPrototype, polyfill) {
	function NodeList() { [polyfill] }
	NodeList.prototype.length = ArrayPrototype.length;

	ElementPrototype.matchesSelector = ElementPrototype.matchesSelector ||
	ElementPrototype.mozMatchesSelector ||
	ElementPrototype.msMatchesSelector ||
	ElementPrototype.oMatchesSelector ||
	ElementPrototype.webkitMatchesSelector ||
	function matchesSelector(selector) {
		return ArrayPrototype.indexOf.call(this.parentNode.querySelectorAll(selector), this) > -1;
	};

	ElementPrototype.ancestorQuerySelectorAll = ElementPrototype.ancestorQuerySelectorAll ||
	ElementPrototype.mozAncestorQuerySelectorAll ||
	ElementPrototype.msAncestorQuerySelectorAll ||
	ElementPrototype.oAncestorQuerySelectorAll ||
	ElementPrototype.webkitAncestorQuerySelectorAll ||
	function ancestorQuerySelectorAll(selector) {
		for (var cite = this, newNodeList = new NodeList; cite = cite.parentElement;) {
			if (cite.matchesSelector(selector)) ArrayPrototype.push.call(newNodeList, cite);
		}

		return newNodeList;
	};

	ElementPrototype.ancestorQuerySelector = ElementPrototype.ancestorQuerySelector ||
	ElementPrototype.mozAncestorQuerySelector ||
	ElementPrototype.msAncestorQuerySelector ||
	ElementPrototype.oAncestorQuerySelector ||
	ElementPrototype.webkitAncestorQuerySelector ||
	function ancestorQuerySelector(selector) {
		return this.ancestorQuerySelectorAll(selector)[0] || null;
	};
})(this, Element.prototype, Array.prototype);

/* Helper Functions
/* ========================================================================== */

function generateTableRow() {
	var emptyColumn = document.createElement('tr');

	//TODO: create timelog entry?
	emptyColumn.innerHTML = '<td><a class="cut">-</a><span contenteditable></span></td>' +
		'<td><span contenteditable></span></td>' +
		'<td><span data-prefix>$</span><span contenteditable>0.00</span></td>' +
		'<td><span contenteditable>0</span></td>' +
		'<td><span data-prefix>$</span><span>0.00</span></td>';

	return emptyColumn;
}

function parseFloatHTML(element) {
	return parseFloat(element.innerHTML.replace(/[^\d\.\-]+/g, ''));// || 0;
}

function parsePrice(number) {
	return number.toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1,');
}

/* Update Number
/* ========================================================================== */

function updateNumber(e) {
	// var
	// activeElement = document.activeElement,
	// value = parseFloat(activeElement.innerHTML),
	// wasPrice = activeElement.innerHTML == parsePrice(parseFloatHTML(activeElement));

	/*if (!isNaN(value) && (e.keyCode == 38 || e.keyCode == 40 || e.wheelDeltaY)) {
		e.preventDefault();

		value += e.keyCode == 38 ? 1 : e.keyCode == 40 ? -1 : Math.round(e.wheelDelta * 0.025);
		value = Math.max(value, 0);

		activeElement.innerHTML = wasPrice ? parsePrice(value) : value;
	}*/

	updateInvoice();
}

/* Update Invoice
/* ========================================================================== */

function updateInvoice() {
	document.title = $('[name="title"]').val();
	var total = 0;
	var unbilled = 0;
	var cells, price, total, a, i;

	// update inventory cells
	// ======================

	for (var a = document.querySelectorAll('table.inventory tbody tr'), i = 0; a[i]; ++i) {
		// get inventory row cells
		cells = a[i].querySelectorAll('span:last-child');
		amount = a[i].querySelector('.timer-amount');
		quantity = a[i].querySelector('.timer-quantity');
		timertotal = a[i].querySelector('.timer-total');
		price = parseFloatHTML(amount) * parseFloatHTML(quantity);

		// add price to total
		if($(a[i]).hasClass('not-billable')){
			unbilled += price;
		
		} else {
			total += price;
		}
		
		//unbilled = 4698.75;//0;//4406.85;

		// set row total
	
		timertotal.innerHTML = price;
	}
	
	for (var sub_total_rows = document.querySelectorAll('table.inventory thead.sub-total-row'), i = 0; sub_total_rows[i]; ++i) {
		sub_total = 0;
		for (var a = document.querySelectorAll('table.inventory thead.sub-total-row')[i].nextElementSibling.querySelectorAll('tr'), ii = 0; a[ii]; ++ii) {
			cells = a[ii].querySelectorAll('span:last-child');
			amount = a[ii].querySelector('.timer-amount');
			quantity = a[ii].querySelector('.timer-quantity');
			timertotal = a[ii].querySelector('.timer-total');
			price = parseFloatHTML(amount) * parseFloatHTML(quantity);
			if($(a[ii]).hasClass('not-billable')){
				// unbilled += price;

			} else {
				sub_total += price;
			}
		}
		timertotal = sub_total_rows[i].querySelector('.sub-total-price');
		timertotal.innerHTML = parsePrice(sub_total);
	}


	// update balance cells
	// ====================

	// get balance cells
	cells = document.querySelectorAll('table.balance td:last-child span:last-child');

	// set total
	cells[0].innerHTML = unbilled;
	cells[1].innerHTML = total;

	// set balance and meta balance

	cells[3].innerHTML = document.querySelector('table.meta tr:last-child td:last-child span:last-child').innerHTML = parsePrice(total);

	// update prefix formatting
	// ========================

	var prefix = document.querySelector('#prefix').innerHTML;
	for (a = document.querySelectorAll('[data-prefix]'), i = 0; a[i]; ++i) a[i].innerHTML = prefix;

	// update price formatting
	// =======================

	for (a = document.querySelectorAll('span[data-prefix] + span'), i = 0; a[i]; ++i) {
		if (document.activeElement != a[i]) {
			a[i].innerHTML = parsePrice(parseFloatHTML(a[i]));
		}	
	}
}

/* On Content Load
/* ========================================================================== */

function onContentLoad() {
	if (window.location.href.indexOf(/invoice/)<0&&window.location.href.indexOf(/task_invoice/)<0) {
		return;
	}
	var authorization = $('[name="authorization"]').val();
	var instanceid = $('[name="instanceid"]').val();
	$.ajaxSetup({
		headers: {
			'authorization': authorization,
			'instanceid': instanceid,
			'Referrer-Policy': 'strict-origin-when-cross-origin'
		}
	});

	if (authorization&&instanceid) {
		setTimeout(function(){
			saveInvoiceTotal();
		}, 500);
	} else {
		return;
	}
	updateInvoice();

	var
	input = document.querySelector('input'),
	image = document.querySelector('img');

	function onClick(e) {
		var element = e.target.querySelector('[contenteditable]'), row;

		element && e.target != document.documentElement && e.target != document.body && element.focus();

		if (e.target.matchesSelector('.add')) {
			document.querySelector('table.inventory tbody').appendChild(generateTableRow());
		}
		else if (e.target.className == 'cut') {
			row = e.target.ancestorQuerySelector('tr');

			row.parentNode.removeChild(row);
			alert('Removing this entry from this invoice. This entry is not deleted. It will just be removed from this invoice.')
			removeFromInvoice(e.target.dataset.id);
		}

		updateInvoice();
	}

	function onEnterCancel(e) {
		e.preventDefault();

		image.classList.add('hover');
	}

	function onLeaveCancel(e) {
		e.preventDefault();

		image.classList.remove('hover');
	}

	function onFileInput(e) {
		image.classList.remove('hover');

		var
		reader = new FileReader(),
		files = e.dataTransfer ? e.dataTransfer.files : e.target.files,
		i = 0;

		reader.onload = onFileLoad;

		while (files[i]) reader.readAsDataURL(files[i++]);
	}

	function onFileLoad(e) {
		var data = e.target.result;

		image.src = data;
	}

	if (window.addEventListener) {
		document.addEventListener('click', onClick);

		document.addEventListener('mousewheel', updateNumber);
		document.addEventListener('keydown', updateNumber);

		document.addEventListener('keydown', updateInvoice);
		document.addEventListener('keyup', updateInvoice);

		input.addEventListener('focus', onEnterCancel);
		input.addEventListener('mouseover', onEnterCancel);
		input.addEventListener('dragover', onEnterCancel);
		input.addEventListener('dragenter', onEnterCancel);

		input.addEventListener('blur', updateInvoice);
		input.addEventListener('dragleave', onLeaveCancel);
		input.addEventListener('mouseout', onLeaveCancel);

		input.addEventListener('drop', onFileInput);
		input.addEventListener('change', onFileInput);
	}
}



function addTimer(id, data){
	$.post('https://app2.projectous.com/api/invoice-timer/'+id+'/save', data);//TODO: onerror
} 



function noteFocus(target, id, invoice_notes, task_title){
	console.log(target)
	var new_invoice_note = ''
	if (task_title) {
		new_invoice_note = invoice_notes.split(task_title)[1]
		target.innerHTML = new_invoice_note
	} 

}


function setInvoiceNotes(target, id, invoice_notes, task_title){
	var new_invoice_note = ''
	if (task_title) {
		new_invoice_note = `${task_title}-${invoice_notes}`
		target.innerHTML = new_invoice_note
	}
	
	$.post('https://app2.projectous.com/api/invoice-timer/'+id+'/save', {invoice_notes: invoice_notes});
}

function setClientRate(id, client_rate){
	$.post('https://app2.projectous.com/api/invoice-timer/'+id+'/save',
	 	{client_rate: client_rate}, function(){
			saveInvoiceTotal()
		});
}

function setQuantity(id, quantity){
	const invoice_duration = quantity * 3600;
	$.post('https://app2.projectous.com/api/invoice-timer/'+id+'/save', {invoice_duration: invoice_duration}, function(){
			saveInvoiceTotal()
		});
}

function setTaskClientRate(id, client_rate){
	$.post('https://app2.projectous.com/api/invoice-timer/'+id+'/save',
	 	{client_rate: client_rate, is_task: true}, function(){
			saveInvoiceTotal()
		});
}

function setTaskQuantity(id, quantity){
	const invoice_duration = quantity * 3600;
	$.post('https://app2.projectous.com/api/invoice-timer/'+id+'/save', {invoice_duration: invoice_duration, is_task: true}, function(){
			saveInvoiceTotal()
		});
}
function removeFromInvoice(id){
	$.post('https://app2.projectous.com/api/invoice-timer/'+id+'/save', {invoice_id: null, real_invoice_id: null});
}

function saveInvoiceTotal(){
	var invoice_id = $('body article table.meta tbody tr:nth-child(1) td span')[0].innerText
	var total = $('body article table.meta tbody tr:nth-child(4) td span:nth-child(2)')[0].innerText
	$.post('https://app2.projectous.com/api/invoice/'+invoice_id+'/save-total', { total});

}

function setInvoiceNote(real_invoice_id, invoice_notes) {
	$.post('https://app2.projectous.com/api/invoice/'+real_invoice_id+'/save', {invoice_notes: invoice_notes});
}

window.addEventListener && document.addEventListener('DOMContentLoaded', onContentLoad);

/*
function saveAndPrint()
{
	$.post('/invoice/save', {to: null, from: 1, invoice_id: null, start: null, end: null}, function(){
		window.print();
	});
}*/
