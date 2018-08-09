<!-- [![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![test][test]][test-url]
[![coverage][cover]][cover-url]
[![chat][chat]][chat-url] -->

# semantic-ui-media-progress-js
Semantic-UI backed media progress bar for HTML 5 \<video\> and \<audio\> elements

This CSS/jQuery plug-in creates an interactive progress bar for HTML 5 \<video\> and \<audio\> elements with features:

- Attach to a \<video\> and \<audio\> element and the progress is updated via HTML Media Event
- Media currentTime can be modified by clicking on or dragging the progress bar
- May add markers on the progress bar

This module depends/extends on Semantic UI's progress bar module for the main functionality. It also uses two other Semantic UI components: icon and popup.

## Install

```bash
npm i semantic-ui-media-progress
```

## Usage

### Include in Your HTML

Include CSS and Javascript in `dist` folder for use in your project. Just link to these files in your HTML.

```html
<link rel="stylesheet" type="text/css" href="../node_modules/semantic-ui-media-progress/dist/mediaProgress.css">
<script src="../node_modules/semantic-ui-media-progress/dist/mediaProgress.js"></script>
```

Note: Modify the paths according to the location of the HTML file.

Make sure to include jQuery and Semantic-UI files as well.

### Minimal Example

```html
<!-- target media element -->
<video type='video/mp4'></video>

<!-- media progress bar -->
<div class="ui progress media" data-media="video">
  <div class="bar">
    <div class="cursor">
      <i class="fitted circle icon"></i>
    </div>
  </div>
</div>
```

To enable the media progress bar, simply execute:

```javascript
$(".ui.media.progress").mediaProgress();
```

The progress bar remain disabled until video is loaded on the \<video\> element.

Now, to add a marker to the progress bar:

```javascript
$(".ui.media.progress").mediaProgress("add marker");
```

...To be completed...

# TODO's

- [ ] Complete documentation
- [ ] Add testing
- [ ] Allow turning off mouse interaction
