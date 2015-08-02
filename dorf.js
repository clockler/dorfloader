(function(uri) {

var constructor = function() {
	this.eventTarget = document.createDocumentFragment();
	this.total = 0;
	this.start = Date.now();
	this.totalTime = 0;
	this.loaded = 0;
	this.loadedItems = 0;
	this.elements = [];
	this.last = 0;
	this.finals = [];
	this.progress = function(e) {
		if(!e.target.loaderinitialized)
		{
			Dorf.total += e.total;
			e.target.loaderinitialized = "true";
			e.target.loaderlast = 0;
		}
		var since = e.timeStamp - Dorf.last,
			lastloaded = Number(e.target.loaderlast);
		Dorf.loaded += (e.loaded - lastloaded);
		e.target.loaderlast = e.loaded;
		if(since > 100) // Only emit progress events every 100ms
		{
			Dorf.last = e.timeStamp;
			Dorf.dispatchEvent(new ProgressEvent("progress", {"lengthComputable": true, "loaded": Dorf.loaded, "total": Dorf.total}));
		}
	};
	this.load = function(e) {
		Dorf.loadedItems++;
		var cfg = e.target.config,
			el = document.createElement(cfg[0]);

		if(cfg[1])
		{
			el.src = URL.createObjectURL(e.target.response);
		} else
		{
			el.innerHTML = e.target.responseText;
		}
		Dorf.resources[e.target.res] = el;
		if(cfg[2] instanceof HTMLElement) // Only a Sith deals in absolutes! Limited instanceof usage is fine.
		{
			Dorf.finals.push(el);
			el.targetElement = cfg[2];
		}

		if(Dorf.loadedItems >= Dorf.elements.length)
		{
			// Process any DOM-insertables
			for(var i = 0; i < Dorf.finals.length; i++)
			{
				Dorf.finals[i].targetElement.appendChild(Dorf.finals[i]);
				delete Dorf.finals[i].targetElement;
			}
			delete Dorf.finals;
			Dorf.totalTime = Date.now() - Dorf.start;
			Dorf.dispatchEvent(new Event("load"));
		}
	};
	this.associations = {
		// Tag to use, is it binary, element to attach to once loaded
		"js": ["script", false, document.head],
		"jpg": ["img", true, null],
		"png": ["img", true, null],
		"gif": ["img", true, null],
		"webp": ["img", true, null],
		"apng": ["img", true, null],
		"tiff": ["img", true, null],
		"bmp": ["img", true, null],
		"ogg": ["audio", true, null],
		"mp3": ["audio", true, null],
		"wav": ["audio", true, null],
		"aac": ["audio", true, null],
		"webm": ["video", true, null],
		"mp4": ["video", true, null],
		"css": ["style", false, document.head]
	};
	this.resources = {};
};
constructor.prototype.addEventListener = function addEventListener(type, callback, capture, untrusted) { return this.eventTarget.addEventListener(type, callback, capture, untrusted); };
constructor.prototype.removeEventListener = function removeEventListener(type, callback, capture) { return this.eventTarget.removeEventListener(type, callback, capture); };
constructor.prototype.dispatchEvent = function dispatchEvent(event) { return this.eventTarget.dispatchEvent(event); };
constructor.prototype.get = function(res)
{
	return this.resources.hasOwnProperty(res)? this.resources[res] : null;
};

Dorf = new constructor();

var resXHR = new XMLHttpRequest();
resXHR.open("GET", uri);
resXHR.addEventListener("load", function() {
	var list = JSON.parse(resXHR.responseText),
		prefix = uri.match(/(.*\/)[^\/]+$/);
	if(!prefix)
	{
		prefix = "";
	} else
	{
		prefix = prefix[1];
	}
	for(var i = 0; i < list.length; i++)
	{
		var item = list[i],
			ext = item.match(/\.(\w+)$/)[1];

		if(Dorf.associations.hasOwnProperty(ext))
		{
			var cfg = Dorf.associations[ext],
				xhr = new XMLHttpRequest();
			Dorf.elements.push(xhr);
			xhr.res = item;
			xhr.config = cfg;
			if(cfg[1])
			{
				xhr.responseType = "blob";
			}
			xhr.addEventListener("progress", Dorf.progress);
			xhr.addEventListener("load", Dorf.load);
			xhr.open("GET", prefix + item);
			xhr.send("");
		}
	}
});
resXHR.send("");

})(document.currentScript.dataset.manifest || "manifest.json");