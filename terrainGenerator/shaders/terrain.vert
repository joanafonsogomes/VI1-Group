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


float h(vec2 coord){
    return texture(noise,coord).x*maxAltitude;
}
float h(float x, float y){
    
    return texture(noise,vec2(x/200,y/200)).x*maxAltitude;
}

void main () {


    vec4 p = position;
    p.y=h(p.x,p.z);
    float d =1/200;
    vec3 derX=  vec3(p.x+1,h(p.x+1,p.z),p.z)
                -vec3(p.x-1,h(p.x-1,p.z), p.z);

    vec3 derY=  vec3(p.x,h(p.x,p.z+1), p.z+1)
                -vec3(p.x,h(p.x,p.z-1), p.z-1);
    n= normalize(m_normal*normalize(cross(normalize(derY),normalize(derX))));
   
    eye = vec3(-(m_viewModel * position)); 
	tc = texCoord0;
    pos = -(m_viewModel * p);
    lDir = normalize(vec3(m_view * -normalize(l_dir)));


    //pos = vec4(position.x + cam.x,0,position.z + cam.y,1);
    gl_Position = m_pvm * p;
	//gl_Position = m_pvm* position;	

}