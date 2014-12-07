#define PI 3.1415926535897932384626433832795
    
uniform float t;
uniform float rot;
uniform vec3 color1;
uniform vec3 color2;

varying vec3 vNormal;
varying vec2 vPos;

float hash(float val) {
  return fract(sin(12.9898 + val) * 43758.5453);
}

bool line(vec2 slope) {
  return mod(atan(vPos.y - slope.y, vPos.x - slope.x), PI / 10.0) < 0.05;
}

bool wavy(vec2 offset, vec2 slope) {
  return mod(dot(vPos, slope) + cos(dot(vPos, offset)), 1.0) < 0.2;
}

bool circle(vec2 center, float size, float fillRatio) {
  return mod(distance(vPos, center), size) < (size * fillRatio);
}

vec3 pattern(float rot) {
  float opt = hash(rot);
  bool c;
  if (opt < 0.2) {
    c = circle(vec2(hash(rot - 1.0), hash(rot - 2.0)), 
               0.29 * hash(rot - 3.0) + 0.01, 
               0.70 * hash(rot - 4.0) + 0.15) || 
        circle(vec2(hash(rot - 5.0), hash(rot - 6.0)), 
               0.29 * hash(rot - 7.0) + 0.01, 
               0.70 * hash(rot - 8.0) + 0.15);
  } else if (opt < 0.4) {
    c = false;
    for (int i = 0; i < 2; i++) {
      c = c || line(vec2(0.5 * (hash(rot - float(2 * i + 1))), 
                         0.5 * (hash(rot - float(2 * i + 2)))));
    }
  } else if (opt < 0.6) {
    c = wavy(
          vec2(25.0 * (hash(rot + 1.0) - 0.5), 
               25.0 * (hash(rot + 2.0) - 0.5)),
          vec2(25.0 * (hash(rot + 3.0) - 0.5), 
               25.0 * (hash(rot + 4.0) - 0.5)));
  } else if (opt < 0.8) {
    float q = sin(15.0 * hash(rot + 1.0) * vPos.x) + 
              pow(3.0 * hash(rot + 2.0) * vPos.y, 
                  hash(rot + 3.0) * 3.0
              );
    c = fract(q) > 0.25;
  } else {
    float q = hash(rot -  1.0) * sin( 2.0 * PI * vPos.x) +
              hash(rot -  2.0) * sin( 4.0 * PI * vPos.x) + 
              hash(rot -  3.0) * sin( 6.0 * PI * vPos.x) +
              hash(rot -  4.0) * sin( 8.0 * PI * vPos.x) +
              hash(rot -  5.0) * sin(10.0 * PI * vPos.x) +
              hash(rot -  6.0) * sin( 2.0 * PI * vPos.y) +
              hash(rot -  7.0) * sin( 4.0 * PI * vPos.y) + 
              hash(rot -  8.0) * sin( 6.0 * PI * vPos.y) +
              hash(rot -  9.0) * sin( 8.0 * PI * vPos.y) +
              hash(rot - 10.0) * sin(10.0 * PI * vPos.y);
    c = q > 0.0;
  }
  return c ? color1 : color2;
}

void main(void)
{
  vec3 lightDir = normalize(vec3(10, 2, 1));
  float intensity = dot(lightDir, normalize(vNormal));
  vec3 color;
  if (vPos.x < 0.5 ^^ mod(rot, 2.0) == 1.0) {
    color = pattern(rot);
  } else {
    color = pattern(rot - 1.0);
  }
  gl_FragColor = vec4((0.3 * intensity + 0.7) * color, 1.0);
}