#version 330

layout(points) in;
layout (line_strip, max_vertices=25) out;


uniform sampler2D noise;
uniform mat4 m_pvm;
uniform float timer;


out float height;

void main() {

    vec4 pos = gl_in[0].gl_Position*10;
    float h;
    


    for(int i=0;i<5;i++){
        float x=pos.x+i;
        for(int j=0;j<5;j++){
            float z=pos.z+j;
            float h = texture(noise,vec2(x,z)).x;
            gl_Position = m_pvm * vec4(x,h,z,pos.a);
            EmitVertex();
        }
    }

    

	EndPrimitive();
}
