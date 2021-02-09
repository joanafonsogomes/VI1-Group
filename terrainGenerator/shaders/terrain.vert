#version 330

uniform mat4 m_pvm, m_viewModel, m_view;
uniform mat3 m_normal;
uniform vec4 l_dir;    //world
uniform vec4 cam;    
uniform sampler2D noise;
uniform float maxHeight, noisyness;

in vec4 position;    //local
in vec3 normal;        //local
in vec2 texCoord0;    //local

out vec4 pos;
out vec3 n, eye, lDir; //camera
out vec2 tc;


float h(float x, float y){
    
    return texture(noise,vec2(x/200,y/200)).x * maxHeight;
}

void main () {

    vec4 p = position;
    p.y = h(p.x,p.z);

    vec3 derX = vec3(p.x+1,h(p.x+1,p.z),p.z) - vec3(p.x-1,h(p.x-1,p.z), p.z);
    vec3 derY = vec3(p.x,h(p.x,p.z+1), p.z+1) - vec3(p.x,h(p.x,p.z-1), p.z-1);
    n= normalize(m_normal*normalize(cross(normalize(derY),normalize(derX))));
   
    eye = vec3(-(m_viewModel * position)); 
	tc = texCoord0;
    pos = p;
    lDir = normalize(vec3(m_view * -normalize(l_dir)));


    gl_Position = m_pvm * p;

}