function initMindMap(mindmap_data)
{
(function($){

  var Renderer = function(canvas){
    var canvas = $(canvas).get(0)
    var ctx = canvas.getContext("2d");
    var particleSystem

    var that = {
      init:function(system){
        particleSystem = system
        particleSystem.screenSize(canvas.width, canvas.height) 
        particleSystem.screenPadding(80)
        that.initMouseHandling()
      },
      
      redraw:function(){
        ctx.fillStyle = "white"
        ctx.fillRect(0,0, canvas.width, canvas.height)
        
        particleSystem.eachEdge(function(edge, pt1, pt2){
          color="rgba(0,0,0, .333)"
          if(edge.color)
            color=edge.color

          ctx.strokeStyle = color
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(pt1.x, pt1.y)
          ctx.lineTo(pt2.x, pt2.y)
          ctx.stroke()
        }) 

        particleSystem.eachNode (function (node, pt)
        {
            text_color="rgba(0,0,0, 1)"
            if(node.text_color)
              text_color=node.text_color

            var w = 10;
            ctx.fillStyle = node.data.color;
            ctx.fillRect (pt.x-w/2, pt.y-w/2, w,w);
            ctx.fillStyle = text_color;
            ctx.font = 'italic 13px sans-serif';
            ctx.fillText (node.data.label, pt.x+8, pt.y+8);
        })
  			
      },
      
      initMouseHandling:function(){
        var dragged = null;
        var handler = {
          clicked:function(e){
            var pos = $(canvas).offset();
            _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
            dragged = particleSystem.nearest(_mouseP);

            if (dragged && dragged.node !== null){
              particleSystem.eachNode (function (node, pt)
              {
                node.text_color = "rgba(0,0,0, 1)";
              })
              particleSystem.eachEdge(function(edge, pt1, pt2){
                if(edge.source==dragged.node)
                {
                  edge.color = "rgba(0,0,255, .666)";
                  edge.target.text_color = "rgba(0,0,255, 1)";
                }else if(edge.target==dragged.node)
                {
                  edge.color = "rgba(255,0,0, .666)";
                  edge.source.text_color = "rgba(255,0,0, 1)";
                }else
                {
                  edge.color = "rgba(0,0,0, .333)";
                }
              })

              dragged.node.fixed = true
              if(dragged.node.data.link!=null)
              {
                window.location = dragged.node.data.link;
              }
            }

            $(canvas).bind('mousemove', handler.dragged)
            $(window).bind('mouseup', handler.dropped)

            return false
          },
          dragged:function(e){
            var pos = $(canvas).offset();
            var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)

            if (dragged && dragged.node !== null){
              var p = particleSystem.fromScreen(s)
              dragged.node.p = p
            }

            return false
          },

          dropped:function(e){
            if (dragged===null || dragged.node===undefined) return
            if (dragged.node !== null) dragged.node.fixed = false
            dragged.node.tempMass = 1000
            dragged = null
            $(canvas).unbind('mousemove', handler.dragged)
            $(window).unbind('mouseup', handler.dropped)
            _mouseP = null
            return false
          }
        }
        $(canvas).mousedown(handler.clicked);

      },
      
    }
    return that
  }    

  $(document).ready(function(){
    var sys = arbor.ParticleSystem(1000, 600, 5)
    sys.parameters({gravity:true})
    sys.renderer = Renderer("#viewport")


    $.each(mindmap_data, function(key_data, value_data){
        node_name = value_data[0]
        node_color = value_data[1]
        node_mass = value_data[2]
        sys.addNode(node_name,{label:node_name,color:node_color,mass:node_mass})
    })

    $.each(mindmap_data, function(key_data, value_data){
      source_node_name = value_data[0]
      source_node_connections = value_data[3]
      $.each(source_node_connections, function(i){
        target_node_name=source_node_connections[i]
        sys.addEdge(source_node_name,target_node_name)
      })
    })
    
  })

})(this.jQuery)

}
