/*
 * # jQuery plug-in based on Semantic UI Progress module for media playback progress bar
 */

import "./mediaProgress.css";

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
        element = this,
        $module = $(this),
        instance = $module.data(moduleNamespace),
        $bar = $(this).find(selector.bar),
        $cursor = $(this).find(selector.cursor),
        $media = null,
        $marker,
        playing = false,
        animeDuration = false,
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
              ? $.extend(true, progressSettings, parameters)
              : progressSettings
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
              return elem instanceof HTMLMediaElement;
            })
            .first();
          if (!media)
            throw "Argument must contain at least one DOM HTMLMediaElement.";

          $media = media;
          module.bind.mediaEvents();

          module.debug("Attached to", $media[0]);
        },

        detach: function() {
          if (!$media) return;
          module.debug("Detached from", $media[0]);
          $media.off(mediaEventNamespace);
          $media = null;
        },

        add: {
          /**
           * Add a marker at the specified time
           * @param[Object] opts  Marker options
           *   - time [Number] time  Marker time in seconds. Ignored if not attached to a media element.
           *   - id [String] Unique element id for the marker div
           *   - color [String] One of Semantic UI color
           *   - position [String] One of [{'bottom'}|'top'|'none'] to specify
           *                       the placement of marker icon
           *   - tooltip [String] Tooltip string
           *   - iconHTML [String|HTMLElement] to specify custom marker icon
           * @returns jQuery object containing the created marker
           */
          marker: function(opts = {}) {
            module.debug("Adding a marker:", opts);
            let $marker = $(
              '<div class="marker"><button>' +
                (opts.iconHTML
                  ? opts.iconHTML
                  : settings.defaultMarkerIconHTML) +
                "</button></div>"
            );
            $module.append($marker);
            if (opts.id) $marker.attr("id", opts.id);
            if (opts.color) $marker.addClass(opts.color);
            if (opts.position) $marker.addClass(opts.position);
            if (opts.position != "top" && !opts.iconHTML)
              $marker.find("button>i").addClass("vertically flipped");
            if (opts.tooltip) {
              $marker.attr("data-tooltip", opts.tooltip);
              $marker.attr("data-variation", "tiny");
              if ($marker.hasClass("top"))
                $marker.attr("data-position", "bottom center");
            }
            if ($media) {
              let media = $media[0];
              if (opts.time && isFinite(media.duration)) {
                let time = (opts.time < 0
                  ? 0
                  : opts.time > media.duration
                    ? media.duration
                    : opts.time
                ).toFixed(3);
                $marker.attr("data-time", time);
                $marker.css(
                  "left",
                  (((time - media.duration) * 100) / media.duration).toFixed(
                    2
                  ) + "%"
                );
              }
            }
            module.debug("Marker created:", $marker);
            return $marker;
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

        read: {
          metadata: function() {
            var data = {
              media: $module.data(metadata.media)
            };
            if (data.media) {
              module.debug(
                "Attaching the media element specified by:",
                data.media
              );
              module.attach(data.media);
            }
          },
          settings: function() {
            if (settings.media !== undefined) {
              module.debug(
                "Attaching the media element specified by:",
                settings.media
              );
              try {
                module.attach(settings.media);
              } catch (e) {
                settings.media = null;
                module.error(e, settings.media);
              }
            }
          }
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
                ".marker",
                module.event.marker.mousedown
              );
            $bar
              .on("mouseenter" + eventNamespace, module.event.bar.mouseenter)
              .on("mouseleave" + eventNamespace, module.event.bar.mouseleave);
          },
          mediaEvents: () => {
            module.verbose("Binding media events");
            $media
              .on(
                "loadedmetadata" + mediaEventNamespace,
                module.event.media.loadedmetadata
              )
              .on(
                "loadeddata" + mediaEventNamespace,
                module.event.media.loadeddata
              )
              .on(
                "loadedmetadata" + mediaEventNamespace,
                module.event.media.loadedmetadata
              )
              .on("emptied" + mediaEventNamespace, module.event.media.emptied)
              .on(
                "timeupdate" + mediaEventNamespace,
                module.event.media.timeupdate
              );
          }
        },

        event: {
          media: {
            loadedmetadata: () => {
              $module.progress("set total", $media[0].duration);
              $module.progress("update progress", 0);
            },
            loadeddata: () => {
              $module.removeClass("disabled");
              $module.progress("update progress", $media[0].currentTime);
            },
            emptied: () => {
              $module.addClass("disabled");
              $cursor.addClass("hide");
              $module.progress("update progress", 0);
            },
            timeupdate: () => {
              $module.progress("update progress", $media[0].currentTime);
            }
          },
          bar: {
            mouseenter: e => {
              $cursor.removeClass("hide");
            },
            mouseleave: e => {
              $cursor.addClass("hide");
            }
          },
          marker: {
            mousedown: e => {
              $marker = $(e.target).closest(".marker");
            }
          },
          mousedown: e => {
            console.log(e.originalEvent.button);
            if (e.originalEvent.button == 0) {
              // only for left-mouse click
              let media = $media[0];
              playing = !media.paused;
              if (playing) media.pause();
              $cursor.addClass("grabbed");
              animeDuration = $bar.css("transition-duration");
              $bar.css("transition-duration", "0s");

              $(window)
                .on("mousemove", module.event.mousemove)
                .on("mouseup", module.event.mouseup);
              module.event.mousemove(e);
            }
            e.stopPropagation();
          },

          // Window mouse event callbacks
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

            let media = $media[0];
            let value =
              (e.originalEvent.pageX - findPos(element)) / element.clientWidth;
            if (value < 0) value = 0;
            else if (value > 1) value = 1;
            let timeToSet = (media.duration * value).toFixed(3);
            $module.progress("update progress", timeToSet);
            media.currentTime = timeToSet;

            if ($marker) {
              $marker.attr("data-time", timeToSet);
              $marker.css("left", (value * 100).toFixed(2) + "%");
            }
          },
          mouseup: e => {
            $(window)
              .off("mousemove", module.event.mousemove)
              .off("mouseup", module.event.mouseup);
            $cursor.removeClass("grabbed");
            $bar.css("transition-duration", animeDuration);
            if ($marker) $marker = null;
            if (playing) $media[0].play();
          }
        },

        // Semantic UI standard functions
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

    defaultMarkerIconHTML: '<i class="fitted marker icon"></i>',

    metadata: {
      media: "media"
    },

    selector: {
      bar: "> .bar",
      cursor: "> .bar > .cursor"
    }
  };
})(jQuery, window, document);
