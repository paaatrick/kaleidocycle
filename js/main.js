var kaleidocycle = function (vert, frag) {
  
  var $window = $(window),
    scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(15,
                                         $window.width() / $window.height(),
                                         1, 100),
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }),
    s = 1,
    n = 8,
    a = 2 * Math.PI / n,
    h = s / Math.SQRT2,
    lambda = h / Math.tan(a),
    kappa = lambda,
    mu = lambda,
    nu = mu,
    t = 0,
    pos = [],
    tetra = [],
    geometry = new THREE.Geometry(),
    material = new THREE.ShaderMaterial({
      uniforms: {
        t: { type: 'f', value: 0.0 },
        rot: { type: 'f', value: 0.0 },
        color1: { type: 'v3', value: new THREE.Vector3(1, 0, 1) },
        color2: { type: 'v3', value: new THREE.Vector3(0, 1, 1) }
      },
      vertexShader: vert,
      fragmentShader: frag,
      side: THREE.DoubleSide
    }),
    salt = Math.floor(Math.random() * 10000) * 2, // needs to be even
    rot = t;
  
  function reflectMatrixZ(theta) {
    var m = new THREE.Matrix4(),
      nx = Math.cos(theta),
      ny = Math.sin(theta);
    m.set(1 - 2 * Math.pow(nx, 2),            -2 * nx * ny, 0, 0,
                     -2 * nx * ny, 1 - 2 * Math.pow(ny, 2), 0, 0,
                                0,                       0, 1, 0,
                                0,                       0, 0, 1);
    return m;
  }
  
  function kaleidoTransform(t) {
    var cost = Math.cos(t),
      sint = Math.sin(t),
      sint2 = Math.pow(sint, 2),
      tana = Math.tan(a),
      mag = 1 / Math.sqrt(1 + sint2 * Math.pow(tana, 2)),
      u1 = cost,
      u2 = 0,
      u3 = sint,
      v1 = -mag * sint,
      v2 = -mag * sint * tana,
      v3 = mag * cost,
      w1 = -mag * sint2,
      w2 = mag,
      w3 = mag * cost * sint * tana,
      t1 = h * (w2 / tana - w1 / 2),
      t2 = h * w2 / 2,
      t3 = 0,
      m = new THREE.Matrix4();
    m.set(u1, w1, v1, t1,
          u2, w2, v2, t2,
          u3, w3, v3, t3,
           0,  0,  0,  1);
    return m;
  }
  
  function update() {
    var m, m2, q, idx;
    
    t += 0.01;
    q = Math.floor(2 * t / Math.PI) + salt;
    if (q !== rot) {
      rot = q;
      material.uniforms.rot.value = rot;
    }
    material.uniforms.t.value = t;
    m = kaleidoTransform(t);
    for (idx = 0; idx < n; idx += 1) {
      m2 = new THREE.Matrix4();
      m2.multiplyMatrices(pos[idx], m);
      tetra[idx].matrix = m2;
    }
  }
  
  function render() {
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
  }
  
  // initialize
  (function () {
    var obj, idx, r, r2;
    
    geometry.vertices.push(
      new THREE.Vector3(-lambda, -h / 2,      0),
      new THREE.Vector3(     mu, -h / 2,      0),
      new THREE.Vector3(      0,  h / 2, -kappa),
      new THREE.Vector3(      0,  h / 2,     nu)
    );
    geometry.faces.push(
      new THREE.Face3(3, 2, 0),
      new THREE.Face3(0, 1, 3),
      new THREE.Face3(1, 0, 2),
      new THREE.Face3(2, 3, 1)
    );
    geometry.faceVertexUvs[0] = [];
    geometry.faceVertexUvs[0][0] = [new THREE.Vector2(0.0, 0.0),
                                    new THREE.Vector2(0.5, 0.5),
                                    new THREE.Vector2(0.0, 0.5)];
    geometry.faceVertexUvs[0][1] = [new THREE.Vector2(0.5, 0.0),
                                    new THREE.Vector2(1.0, 0.5),
                                    new THREE.Vector2(0.5, 0.5)];
    geometry.faceVertexUvs[0][2] = [new THREE.Vector2(0.5, 0.5),
                                    new THREE.Vector2(1.0, 1.0),
                                    new THREE.Vector2(0.5, 1.0)];
    geometry.faceVertexUvs[0][3] = [new THREE.Vector2(0.0, 0.5),
                                    new THREE.Vector2(0.5, 1.0),
                                    new THREE.Vector2(0.0, 1.0)];
    geometry.computeFaceNormals();
    
    renderer.setSize($window.width(), $window.height());
    document.body.appendChild(renderer.domElement);

    $window.resize(function () {
      renderer.setSize($window.width(), $window.height());
      camera.aspect = $window.width() / $window.height();
      camera.updateProjectionMatrix();
    });

    for (idx = 0; idx < n; idx += 1) {
      obj = new THREE.Mesh(geometry.clone(), material);
      obj.matrixAutoUpdate = false;
      scene.add(obj);
      tetra.push(obj);
    }

    for (idx = 0; idx < n / 2; idx += 1) {
      r = new THREE.Matrix4();
      r.makeRotationZ(2 * a * idx);
      pos.push(r.clone());

      r2 = new THREE.Matrix4();
      r2.multiplyMatrices(reflectMatrixZ(2 * a * idx + a + Math.PI / 2), r);
      pos.push(r2.clone());
    }

    camera.position.set(0, 0, 12);
    camera.up.set(0, 1, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  }());
  
  return {
    
    render: render,
    
    applyColors: function (element) {
      var colors = element.data('colors').split(',').map(function (color) {
        var c = new THREE.Color('#' + color);
        return new THREE.Vector3(c.r, c.g, c.b);
      });
      material.uniforms.color1.value = colors[0];
      material.uniforms.color2.value = colors[1];
    }
    
  };
};


$(function () {
  var duration = 200,
    kal;
  
  $.when(
    $.ajax('shaders/vertex.glsl'),
    $.ajax('shaders/fragment.glsl')
  ).done(function (vert, frag) {
    try {
      kal = kaleidocycle(vert[0], frag[0]);
      kal.applyColors($('.palette').first());
      kal.render();
    } catch (e) {
      $('.fallback').show();
    }
  });
  
  $('.menu-body').hide();
  $('.menu-button').click(function () {
    $('.menu-body').slideToggle(duration);
    $(this).toggleClass('open');
  });
  
  $('.palette').click(function () {
    kal.applyColors($(this));
    $('.menu-button').removeClass('open');
    $('.menu-body').slideUp(duration);
  });
  
  $('.palette').each(function () {
    var $this = $(this),
      colors = $this.data('colors').split(',');
    $('<div>')
      .addClass('swatch')
      .css('background-color', '#' + colors[0])
      .appendTo($this);
    $('<div>')
      .addClass('swatch tri')
      .css('border-bottom-color', '#' + colors[1])
      .appendTo($this);
  });
});