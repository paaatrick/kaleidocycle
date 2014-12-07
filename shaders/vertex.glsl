varying vec3 vNormal;
varying vec2 vPos;
void main()
{
  vNormal = normalize(normalMatrix * normal); 
  vPos = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}