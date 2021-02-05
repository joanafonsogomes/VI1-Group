#version 330

uniform mat4 m_pvm, m_viewModel, m_view;
uniform mat3 m_normal;
uniform vec4 l_dir;    //world
uniform float maxAltitude;
uniform vec4 cam;    
uniform sampler2D noise;

in vec4 position;    //local
in vec3 normal;        //local
in vec2 texCoord0;    //local

out vec4 pos;
out vec3 n, eye, lDir; //camera
out vec2 tc;

void main () {


    vec4 p = position;
    p.y=texture(noise,texCoord0).x * maxAltitude;

    eye = vec3(-(m_viewModel * position)); 
	tc = texCoord0;
    n = normalize(m_normal * normal);
    pos = -(m_viewModel * p);
    lDir = normalize(vec3(m_view * -normalize(l_dir)));


    //pos = vec4(position.x + cam.x,0,position.z + cam.y,1);
    gl_Position = m_pvm * p;
	//gl_Position = m_pvm* position;	

}