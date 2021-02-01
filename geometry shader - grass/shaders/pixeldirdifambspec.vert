#version 330

uniform mat4 m_pvm;
uniform mat4 m_viewModel;
uniform mat3 m_normal;
uniform vec4 l_dir;    //world
uniform mat4  m_view;

in vec4 position;    //local
in vec3 normal;        //local
in vec2 texCoord0;    //local


out vec4 pos;
out vec3 n, lDir; //camera
out vec2 tc;
void main () {




	tc = texCoord0;
    n = normalize(m_normal * normal);
    pos = -(m_viewModel * position);
    lDir = normalize(vec3(m_view * -l_dir));

	gl_Position = m_pvm* position;	

}