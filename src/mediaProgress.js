/*!
 * # jQuery plug-in based on Semantic UI Progress module for media playback progress bar
 */

(function($, window, document, undefined) {
  "use strict";

  window =
    typeof window != "undefined" && window.Math == Math
      ? window
      : typeof self != "undefined" && self.Math == Math
        ? self
        : Function("return this")();

  var global =
    typeof window != "undefined" && window.Math == Math
      ? window
      : typeof self != "undefined" && self.Math == Math
        ? self
        : Function("return this")();

  $.fn.mediaProgress = function(parameters) {
    var $allModules = this,
      // hasTouch       = ('ontouchstart' in document.documentElement),
      query = arguments[0],
      methodInvoked = typeof query == "string",
      queryArguments = [].slice.call(arguments, 1),
      returnedValue;

    $allModules.each(function() {
      var settings = $.isPlainObject(parameters)
          ? $.extend(true, {}, $.fn.mediaProgress.settings, parameters)
          : $.extend({}, $.fn.mediaProgress.settings),
        metadata = settings.metadata,
        namespace = settings.namespace,
        selector = settings.selector,
        error = settings.error,
        namespace = settings.namespace,
        eventNamespace = "." + namespace,
        moduleNamespace = "module-" + namespace,
        mediaEventNamespace = ".media-" + namespace,
        playing = false,
        animeDuration = false,
        $module = $(this),
        $bar = $(this).find(selector.bar),
        $cursor = $(this).find(selector.cursor),
        $media = null,
        element = this,
        instance = $module.data(moduleNamespace),
        module;

      module = {
        initialize: function() {
          module.debug("Initializing media progress bar", settings);

          module.read.metadata();
          module.read.settings();

          // create Semantic-UI progress module
          let progressSettings = {
            duration: 250,
            autoSuccess: false,
            showActivity: false,
            precision: 100
          };
          $module.progress(
            $.isPlainObject(progressSettings)
              ? $.extend(
                  true,
                  progressSettings,
                  $.fn.progress.settings,
                  parameters
                )
              : $.extend(progressSettings, $.fn.progress.settings)
          );

          $module.addClass("disabled");
          $cursor.addClass("hide");
          module.bind.events();

          module.instantiate();
        },

        instantiate: function() {
          module.verbose("Storing instance of mediaProgress", module);
          instance = module;
          $module.data(moduleNamespace, module);
        },

        destroy: function() {
          module.verbose("Destroying previous mediaProgress for", $module);

          $module.progress("destroy");
          module.detach();
          $module.removeData(moduleNamespace);
          instance = undefined;
        },

        attach: function(media) {
          console.log(media);
          if ($media) module.detach(media);
          if (!media) return;
          if (typeof media == "string" || media instanceof HTMLMediaElement) {
            media = $(media);
          } else if (!(media instanceof jQuery)) {
            throw "Argument must be id string, DOM HTMLMediaElement, or jQuery object.";
          }

          // assign the first media element
          media = media
            .filter((i, elem) => {
              console.log(elem)
              return elem instanceof HTMLMediaElement;
            })
            .first();
          if (!media)
            throw "Argument must contain at least one DOM HTMLMediaElement.";

          $media = media;
          module.bind.mediaEvents();
        },

        detach: function() {
          if (!$media) return;
          $media.off(mediaEventNamespace);
          $media = null;
        },

        bind: {
          events: function() {
            // if (hasTouch) {
            //   module.bind.touchEvents();
            // }
            // module.bind.keyboardEvents();
            // module.bind.inputEvents();
            module.bind.mouseEvents();
          },
          touchEvents: function() {},
          keyboardEvents: function() {},
          inputEvents: function() {},
          mouseEvents: function() {
            module.verbose("Binding mouse events");
            $module
              .on("mousedown" + eventNamespace, module.event.mousedown)
              .on(
                "mousedown" + eventNamespace,
                selector.bar + "," + selector.cursor,
                module.event.mousedown
              );
            $bar
              .on("mouseenter" + eventNamespace, module.event.bar.mouseeter)
              .on("mouseenter" + eventNamespace, module.event.bar.mouseleave);
          },
          mediaEvents: () => {
            $media
              .on(
                "loadedmetadata" + mediaEventNamespace,
                module.event.loadedmetadata
              )
              .on("loadeddata" + mediaEventNamespace, module.event.loadeddata)
              .on(
                "loadedmetadata" + mediaEventNamespace,
                module.event.loadedmetadata
              )
              .on("emptied" + mediaEventNamespace, module.event.emptied)
              .on("timeupdate" + mediaEventNamespace, module.event.timeupdate);
          }
        },

        event: {
          media: {
            loadedmetadata: () => {
              $module.progress("set total", $media.duration);
              $module.progress("update progress", 0);
            },
            loadeddata: () => {
              $module.removeClass("disabled");
              $module.progress("update progress", $media.currentTime);
            },
            emptied: () => {
              $module.addClass("disabled");
              $cursor.addClass("hide");
              $module.progress("update progress", 0);
            },
            timeupdate: () => {
              $module.progress("update progress", $media.currentTime);
            }
          },
          bar: {
            enter: e => {
              $cursor.removeClass("hide");
            },
            leave: e => {
              $cursor.addClass("hide");
            }
          },

          mousedown: e => {
            playing = !$media.paused;
            if (playing) $media.pause();
            $cursor.addClass("grabbed");
            animeDuration = $bar.css("transition-duration");
            $bar.css("transition-duration", "0s");

            $(window)
              .on("mousemove", module.event.mousemove)
              .on("mouseup", module.event.mouseup);

            e.stopPropagation();
            module.event.mousedown(e);
          },

          // Set the play position of the video based on the mouse click at x
          mousemove: e => {
            const findPos = obj => {
              var curleft = 0;
              if (obj.offsetParent) {
                do {
                  curleft += obj.offsetLeft;
                } while ((obj = obj.offsetParent));
              }
              return curleft;
            };

            let progressBar = $module[0];
            let value =
              (e.originalEvent.pageX - findPos(progressBar)) /
              progressBar.clientWidth;
            let timeToSet = ($media.duration * value).toFixed(2);
            $module.progress("update progress", timeToSet);
            $media.currentTime = timeToSet;
          },

          mouseup: e => {
            $(window)
              .off("mousemove", module.event.mousemove)
              .off("mouseup", module.event.mouseup);
            $cursor.removeClass("grabbed");
            $bar.css("transition-duration", animeDuration);
            if (playing) $media.play();
          }
        },
        read: {
          metadata: function() {
            var data = {
              media: $module.data(metadata.media)
            };
            if (data.media) {
              module.debug(
                "Associated media element set from metadata",
                data.media
              );
              module.attach(data.media);
            }
          },
          settings: function() {
            if (settings.$media !== null) {
              module.debug(
                "Associated media element set in settings",
                settings.$media
              );
              try {
                module.attach(settings.$media);
              } catch (e) {
                settings.$media = null;
                module.error(e, settings.$media);
              }
            }
          }
        },

        get: {
          media: function() {
            return module.$media[0];
          }
        },

        set: {
          media: function(mediaValue) {
            module.attach(mediaValue);
          },
          barWidth: function(value) {
            $module.progress("set barWidth", value);
          }
        },

        setting: function(name, value) {
          module.debug("Changing setting", name, value);
          let rval = $module.progress("setting", name, value);
          if (rval === undefined) {
            if ($.isPlainObject(name)) {
              $.extend(true, settings, name);
            } else if (value !== undefined) {
              if ($.isPlainObject(settings[name])) {
                $.extend(true, settings[name], value);
              } else {
                settings[name] = value;
              }
            } else {
              rval = settings[name];
            }
          }
          return rval;
        },
        internal: function(name, value) {
          if ($.isPlainObject(name)) {
            $.extend(true, module, name);
          } else if (value !== undefined) {
            module[name] = value;
          } else {
            return module[name];
          }
        },
        debug: function() {
          if (!settings.silent && settings.debug) {
            module.debug = Function.prototype.bind.call(
              console.info,
              console,
              settings.name + ":"
            );
            module.debug.apply(console, arguments);
          }
        },
        verbose: function() {
          if (!settings.silent && settings.verbose && settings.debug) {
            module.verbose = Function.prototype.bind.call(
              console.info,
              console,
              settings.name + ":"
            );
            module.verbose.apply(console, arguments);
          }
        },
        error: function() {
          if (!settings.silent) {
            module.error = Function.prototype.bind.call(
              console.error,
              console,
              settings.name + ":"
            );
            module.error.apply(console, arguments);
          }
        },
        invoke: function(query, passedArguments, context) {
          var object = instance,
            maxDepth,
            found,
            response;
          passedArguments = passedArguments || queryArguments;
          context = element || context;
          if (typeof query == "string" && object !== undefined) {
            query = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue =
                depth != maxDepth
                  ? value +
                    query[depth + 1].charAt(0).toUpperCase() +
                    query[depth + 1].slice(1)
                  : query;
              if (
                $.isPlainObject(object[camelCaseValue]) &&
                depth != maxDepth
              ) {
                object = object[camelCaseValue];
              } else if (object[camelCaseValue] !== undefined) {
                found = object[camelCaseValue];
                return false;
              } else if ($.isPlainObject(object[value]) && depth != maxDepth) {
                object = object[value];
              } else if (object[value] !== undefined) {
                found = object[value];
                return false;
              } else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ($.isFunction(found)) {
            response = found.apply(context, passedArguments);
          } else if (found !== undefined) {
            response = found;
          }
          if ($.isArray(returnedValue)) {
            returnedValue.push(response);
          } else if (returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          } else if (response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if (methodInvoked) {
        if (instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      } else {
        if (instance !== undefined) {
          instance.invoke("destroy");
        }
        module.initialize();
      }
    });

    return returnedValue !== undefined ? returnedValue : this;
  };

  $.fn.mediaProgress.settings = {
    name: "Media Progress",
    namespace: "mediaProgress",

    silent: false,
    debug: false,
    verbose: false,

    metadata: {
      media: "media"
    },

    selector: {
      bar: "> .bar",
      cursor: "> .bar > .cursor"
    }
  };
})(jQuery, window, document);
