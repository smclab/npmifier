## npmify

Command Line Tool — `npmifier`
==============================

It enables npm support in your Titanium Classic application.

> **NOT READY FOR PRODUCTION USE!** Use [`titaniumifier`][titaniumifier] instead!

[titaniumifier]: https://github.com/smclab/titaniumifier


Cool things
-----------

- You can use any npm package you want! (almost…)
- Supports debug! (with a Studio plugin…)
- Once correctly setup you’ll be able to **use transpilers** (like coffee-script) without any hussle **AND debug your app!** (there’s no documentation yet…)


Installation
------------

```
[sudo] npm install --global npmifier
```

Then in your Titanium Classic application do:

> **Disclaimer!** Backup your app and test it on a clone! It is an intrusive action!

```
npmifier convert
```

A `package.json` will be created for you, and your `Resource` folder will be moved to `Sources`.

From this moment on you can run it as you’re used to, with Titanium Studio or the CLI.

You can install npm modules as you‘re used to with Node.js projects.


Debugging
---------

Debug will not work on *npmified* apps. To enable it you need to install our custom Titanium Studio plugin. Just go to `Help › Install New Software… › Add…` and use `http://smclab.github.io/it.smc.titanium.npmify.updatesite` as url.

Once installed edit your `.project` file to present **as the first Project Nature** the following:

```
<nature>it.smc.titanium.npmify.core.nature</nature>
```

Now you’ll debug *npmified* apps like a boss directly from Titanium Studio!


TODO
----

- [ ] Support assets (images, fonts…)
- [ ] Support for `titaniumifier` modules
- [ ] Support for `titanium-resolve`-style module resolution
- [ ] Document transformation support (coffee-script, ES6…)
- [ ] Support debug breakpoints on non-js files (you need the `debugger` keyword by now)
- [ ] Use `bluebird` instead of `when`
- [ ] Use `titaniumifier` itself
- [ ] Use [@tonylukasavage’s `tiapp.xml`][tiappxml] instead of our own homebrewed solution

[tiappxml]: https://github.com/tonylukasavage/tiapp.xml


Credits
-------

Humbly made the spry ladies and gents at SMC.

License
-------

This library, *npmifier*, is free software ("Licensed
Software"); you can redistribute it and/or modify it under the terms of the [GNU
Lesser General Public License](http://www.gnu.org/licenses/lgpl-2.1.html) as
published by the Free Software Foundation; either version 2.1 of the License, or
(at your option) any later version.

This library is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; including but not limited to, the implied warranty of MERCHANTABILITY,
NONINFRINGEMENT, or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General
Public License for more details.

You should have received a copy of the [GNU Lesser General Public
License](http://www.gnu.org/licenses/lgpl-2.1.html) along with this library; if
not, write to the Free Software Foundation, Inc., 51 Franklin Street, Fifth
Floor, Boston, MA 02110-1301 USA
