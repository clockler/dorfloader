# Dorfloader

Dorfloader is a simple JS resource loader with the least possible implementation overhead for you, the developer.

## Usage

First, you'll need a JSON list of the files you want to load somewhere. Just an array in a file - something like `["script.js"]` in `res/manifest.json` for our example. Then, on your page:

    <script src="res/dorf.min.js" data-manifest="res/manifest.json"></script>

That's really all there is to it! Dorfloader will now load all files listed in `res/manifest.json`, emitting `progress` events as often as every 100ms during the load and a `load` event when all items are complete. Scripts will not be processed until all items are loaded, so feel free to assume that on execution everything is ready for you - no waiting for events, just pure Javascript slurry without a care in the world.

To actually **access your loaded resources**, should you want to, you can use `Dorf.get(resource)` where `resource` is any file as written in your manifest. You can also probably rely on the cache, but I wouldn't know anything about that. I'm just a Javascript monkey.

## Notes

* If omitted, the `data-manifest` attribute is assumed to be simply `manifest.json` relative to the current page.
* All paths in `manifest.json` are relative to said file.
* As of this writing, Dorfloader is not particularly polished. If things break a little, they'll probably break a lot. Feel free to file issues, they'll motivate me to fix or eventually rewrite it.
* If loading certain resources that do not properly expose their total size, the `loaded` property may exceed the `total` property. Keep this in mind if using this to provide a progress bar, and if it really bothers you, fix your damn server and/or mirror the resources.