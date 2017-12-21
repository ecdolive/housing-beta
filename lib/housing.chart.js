(function($){

  Array.prototype.pushArray = function(array) {
    this.push.apply(this,array);
  };

  $.fn.chart = function(chart){
    this.empty();
    var container = {};
      container.element = this;
      container.height = container.element.parent().height();
      container.width = container.element.parent().width();
      container.innerHeight = container.height - (container.element.outerHeight() - container.element.height());
      container.innerWidth = container.width - (container.element.outerWidth() - container.element.width());
    chart.labels = {};
      chart.labels.bottom = {};
      chart.labels.side = {};
      chart.labels.bottom.height = parseFloat(container.element.css('line-height'));
    chart.viz = {};
      chart.viz.height = container.innerHeight - chart.labels.bottom.height;
      chart.viz.width = container.innerWidth;
    // x-axis values
    var lengths = [];
    var range = [0,1];
    $.each(chart.lines,function(n){
      range.pushArray(this.values);
      lengths[n] = this.values.length;
    });
    var length = Math.max.apply(Math,lengths); // number of points on the line with the largest number of points
    var spacing = chart.viz.width / (length - 1); // space between each point
    var snaps = [];
    for(var a=0; a<length; a++){
      snaps[a] = spacing * a;
    }
    // y-axis values
    var max = Math.max.apply(Math,range); // maximum y-axis value
    // console.log('min: ' + min + ', max: ' + max + ', total: ' + total + ', scale: ' + scale);
        // used if creating horizontal markers {
        var y_increments = Math.log(max) / Math.log(11); // get log11 of max
        y_increments = Math.floor(y_increments);
        y_increments = Math.pow(10,y_increments);
        var y_steps = Math.ceil(max / y_increments);
        max = y_steps * y_increments;
        // }
    var min = Math.min.apply(Math,range); // minimum y-axis value
        var y_steps_negative = Math.floor(min / y_increments);
        min = y_steps_negative * y_increments;
    var total = max - min; // total number of points needed for the y-axis
    var scale = chart.viz.height / total; // vertically scale-factor based on container height and total number of points needed for the y-axis
    // console.log('min: ' + min + ', max: ' + max + ', total: ' + total + ', scale: ' + scale);

    // create svg element in container
    var svg = $('<svg preserveAspectRatio="xMidYMid meet" focusable="true"></svg>').css({
      'display': 'block',
      'height': container.innerHeight,
      'overflow': 'visible',
      'width': container.innerWidth
    });
    if(chart.css){
      svg.css(chart.css);
    }
    container.element.append(svg);

    // create horizontal markers
    var h_markers = $('<g class="h-markers"></g>');
    // var side_labels = $('<g class="side-labels" transform="translate(0,' + (parseFloat(container.element.css('line-height')) / 4) + ')"></g>');
    // var side_labels = $('<g class="side-labels" transform="translate(0,-1)"></g>');
        var fontsize = 12;
        var lineheight = 14;
    var side_labels = $('<g class="side-labels" transform="translate(0,' + (fontsize - ((lineheight - fontsize) / 2)) + ')"></g>');
    for(var a=0; a<=y_steps; a++){
      var points = makeHAxisPoints(y_increments * a);
      var color = '#eeeeee';
      if(a == 0) color = '#cccccc';
      h_markers.append('<polyline fill="none" stroke="' + color + '" stroke-width="1" points="' + points + '"></polyline>');
      var y = makeTrackerDot(y_increments * a);
      var y_label = y_increments * a;
      var postfixes = [
        {'value': 1e12, 'letter': 'T'},
        {'value': 1e9, 'letter': 'B'},
        {'value': 1e6, 'letter': 'M'},
        {'value': 1e3, 'letter': 'K'}
      ];
      $.each(postfixes,function(){
        if(y_label >= this.value){
          y_label = (y_label / this.value) + this.letter;
        }
      });
      // side_labels.append('<text x="0" y="' + y + '" style="cursor: default; user-select: none; -webkit-font-smoothing: antialiased; font-family: Roboto; font-size: 11px;" fill="#757575">' + y_label + '</text>');
      var text = $('<text></text>').attr({
        // 'fill': '#757575',
        'fill': 'rgb(212,212,212)',
        'x': 0,
        'y': y
      }).css({
        'cursor': 'default',
        'font-family': '-apple-system, ".SFNSText-Light", ".SFNSDisplay-Regular", "Helvetica Neue", sans-serif',
        'font-size': fontsize + 'px',
        '-webkit-font-smoothing': 'antialiased',
        'line-height': lineheight + 'px',
        'font-weight': '800',
        'user-select': 'none'
      }).html(y_label);
      if(y_label != '0')
      side_labels.append(text);
    }
    for(var a=y_steps_negative; a<=0; a++){
      var points = makeHAxisPoints(y_increments * a);
      var color = '#eeeeee';
      if(a == 0) color = '#cccccc';
      if(a != 0) h_markers.append('<polyline fill="none" stroke="' + color + '" stroke-width="1" points="' + points + '"></polyline>');
      var y = makeTrackerDot(y_increments * a);
      var y_label = y_increments * a;
      var postfixes = [
        {'value': -1e12, 'letter': 'T'},
        {'value': -1e9, 'letter': 'B'},
        {'value': -1e6, 'letter': 'M'},
        {'value': -1e3, 'letter': 'K'}
      ];
      $.each(postfixes,function(){
        if(y_label <= this.value){
          y_label = -(y_label / this.value) + this.letter;
        }
      });
      // side_labels.append('<text x="0" y="' + y + '" style="cursor: default; user-select: none; -webkit-font-smoothing: antialiased; font-family: Roboto; font-size: 11px;" fill="#757575">' + y_label + '</text>');
      var text = $('<text></text>').attr({
        // 'fill': '#757575',
        'fill': 'rgb(212,212,212)',
        'x': 0,
        'y': y
      }).css({
        'cursor': 'default',
        'font-family': '-apple-system, ".SFNSText-Light", ".SFNSDisplay-Regular", "Helvetica Neue", sans-serif',
        'font-size': fontsize + 'px',
        '-webkit-font-smoothing': 'antialiased',
        'line-height': lineheight + 'px',
        'font-weight': '800',
        'user-select': 'none'
      }).html(y_label);
      if(a != y_steps_negative)
      side_labels.append(text);
    }
    svg.append(h_markers);
    svg.append(side_labels);

    // create each line
    var lines = $('<g class="svg-lines"></g>');
    $.each(chart.lines,function(n){
      var color = this.color || '#666666';
      var weight = this.weight || chart.weight || 1; // try specific line weight, then group weight, then 1
      var points = makeLinePoints(this.values);
      lines.append('<polyline fill="none" stroke="' + color + '" stroke-width="' + weight + '" points="' + points + '"></polyline>');
    });
    svg.append(lines);

    // create bottom labels (dates)
    var bottom_labels = $('<g class="bottom-labels" transform="translate(0,' + container.innerHeight + ')"></g>');
    for(var a=0; a<length; a++){
      // bottom_labels.append('<text x="' + (spacing * a) + '" y="0" text-anchor="middle" style="cursor: default; user-select: none; -webkit-font-smoothing: antialiased; font-family: -apple-system, \'.SFNSText-Light\', \'.SFNSDisplay-Regular\', \'Helvetica Neue\', sans-serif; font-size: 11px;" fill="#757575">' + a + '</text>');
      var text = $('<text></text>').attr({
        'fill': '#757575',
        'text-anchor': 'middle',
        'x': spacing * a,
        'y': 0
      }).css({
        'cursor': 'default',
        'font-family': '-apple-system, ".SFNSText-Light", ".SFNSDisplay-Regular", "Helvetica Neue", sans-serif',
        'font-size': '11px',
        '-webkit-font-smoothing': 'antialiased',
        'user-select': 'none'
      }).html(a);
      bottom_labels.append(text);
    }
    svg.append(bottom_labels);
    if(length > container.innerWidth / (parseFloat(container.element.css('line-height')) + 1)){
      $('.bottom-labels > text:nth-of-type(even)').css('display','none');
    }

    // create tracker, dots, and tooltip
    var i = '0 0 0 ' + chart.viz.height;
    var ul = $('<ul class="tooltip"></ul>').css({
      'background-color': 'rgba(255,255,255,1)',
      'border-radius': '2px',
      'box-shadow': '0 1px 4px rgba(0,0,0,.1)',
      'color': '#000000',
      'font-size': '12px',
      'left': 0,
      'list-style': 'none',
      'margin': '0',
      'padding': '4px 8px',
      'position': 'absolute',
      'top': 0,
      // 'transition': 'left 1s',
      'white-space': 'nowrap'
    });
    var tracker = $('<g class="svg-tracker"></g>');
    tracker.append('<polyline fill="none" stroke="' + chart.tracker.color + '" stroke-width="1" points="' + i + '" class="tracker"></polyline>');
    $.each(chart.tracker.plots,function(n){
      // tracker values with no line
      var li = $('<li></li>').attr('data-type','no-line').css({
        'align-items': 'center',
        'display': 'flex',
        'flex-direction': 'row',
        'padding': '1px'
      });
      ul.append(li);
    });
    $.each(chart.lines,function(n){
      // tracker values with a line
      if(this.track != false) this.track = true;
      tracker.append('<circle fill="' + this.color + '" stroke="none" cx="0" cy="0" r="' + chart.tracker.radius + '" class="dots"></circle>');
      var li = $('<li></li>').attr({
        'data-type': 'line',
        'data-format': 'currency'
      }).css({
        'align-items': 'center',
        'display': 'flex',
        'flex-direction': 'row',
        'padding': '1px'
      });
      ul.append(li);
    });
    container.element.append(ul);
    svg.append(tracker);

    // display svg
    var viewbox = '0 0 ' + container.innerWidth + ' ' + container.innerHeight;
    svg.attr('viewBox',viewbox);
    svg.html(svg.html());
    $('.tracker, .dots, .tooltip').hide();

            // var ccc = 0;
            // $.each(bottom_labels.children('text'),function(){
            //   // ccc = ccc + $(this).width();
            //   // $(this).css('font-size','30');
            //   console.log('text width: ' + this.getComputedTextLength());
            //   ccc = ccc + this.getComputedTextLength();
            // });
            // console.log('full width: ' + ccc);


    // show tracker line, dots, and tooltip when mousing over chart
    svg.mousemove(function(event){
      var left = event.pageX - $(this).offset().left;
      var top = event.pageY - $(this).offset().top;
      var x_values = snapTracker(left);
      var points = x_values.left + ',0 ' + x_values.left + ',' + chart.viz.height;
      $.each(chart.lines,function(n){
        if(this.track){
          var cx = x_values.left;
          var cy = makeTrackerDot(this.values[x_values.step]);
          var dot = '<div style="border-radius: 5px; background-color: ' + this.color + '; height: 5px; margin-right: 8px; width: 5px"></div>';
          if(cy != null){
            svg.find('.dots').eq(n).attr({
              'cx': cx,
              'cy': cy
            }).show();
            svg.siblings('.tooltip').children('li[data-type="line"]').eq(n).html(dot + '<div>' + this.name + ': ' + this.values[x_values.step] + '</div>');
          }
          else {
            svg.siblings('.tooltip').children('li[data-type="line"]').eq(n).html(dot + '<div>' + this.name + '</div>');
          }
        }
        else {
          $('.dots').eq(n).hide();
          svg.siblings('.tooltip').children('li[data-type="line"]').eq(n).hide();
        }
        // console.log(this.name + ': ' + this.values[x_values.step]);
      });
      $.each(chart.tracker.plots,function(n){
        var dot = '<div style="border-radius: 5px; background-color: ' + this.color + '; height: 5px; margin-right: 4px; width: 5px"></div>';
        var prefix = this.prefix || '';
        var suffix = this.suffix || '';
        svg.siblings('.tooltip').children('li[data-type="no-line"]').eq(n).html(dot + '<div>' + prefix + this.values[x_values.step] + suffix + '</div>');
      });
      $('.tracker').attr('points',points).show();
      // set tooltip position
      var tt_left = event.pageX - $(container.element).offset().left + spacing; // event.pageX + spacing,
      var tt_top = event.pageY - $(container.element).offset().top - (svg.siblings('.tooltip').height() / 2); // event.pageY - ($('.tooltip').height() / 2)
      if(tt_left + $(container.element).offset().left + svg.siblings('.tooltip').outerWidth() > $(window).width()){
        tt_left = tt_left - svg.siblings('.tooltip').outerWidth() - (spacing * 2);
      }
      svg.siblings('.tooltip').css({
        'left': tt_left,
        'top': tt_top
      }).show();
    });
    svg.mouseout(function(){
      $('.tracker, .dots, .tooltip').hide();
    });

    function makeLinePoints(a){
      var years = a.length;
      var points = '';
      for(var n=0; n<years; n++){
        // var x = n * (width / (years - 1));
        var x = n * spacing;
        var y = (scale * (a[n] - min));
        y = chart.viz.height - y;
        points += x + ',' + y + ' ';
      }
      return $.trim(points);
    };

    function makeTrackerDot(a){
      var y = (scale * (a - min));
      y = chart.viz.height - y;
      if(a == null) return null;
      else return y;
    };

    function makeHAxisPoints(a){
      var x = (length - 1) * spacing;
      var y = (scale * (a - min));
      y = chart.viz.height - y;
      return $.trim('0,' + y + ' ' + x + ',' + y + ' ');
    };

    function makeVAxisPoints(a){
      var x = a * spacing;
      return $.trim(x + ',0 ' + x + ',' + chart.viz.height);
    };

    function snapTracker(x_pos){
      var closest = null;
      var step = null;
      $.each(snaps, function(n){
        if(closest == null || Math.abs(this - x_pos) < Math.abs(closest - x_pos)) {
          closest = this;
          step = n;
        }
      });
      // console.log('left: ' + x_pos + '\nclosest:' + closest + '\nstep:' + step + '\nsnaps: ' + snaps);
      var left = closest;
      var top = 0;
      return {'left': left, 'top': top, 'step': step};
    };
  };

}(jQuery));
