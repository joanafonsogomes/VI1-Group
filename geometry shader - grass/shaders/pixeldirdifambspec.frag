#version 420

uniform	vec4 diffuse = vec4(1.0);
uniform sampler2D jupiter;
uniform float shininess = 128;

in vec4 pos;
in vec3 n, lDir;
in vec2 tc;


in Data {
	float height;
	float green;
} DataIn;

out vec4 colorOut;

void main() {


	vec4 spec = vec4(0);
	float i = dot(normalize(lDir), normalize(n));
    float intensity = max(0,i);

    if(intensity > 0) //DIA
    {
        vec3 h = normalize(normalize(lDir)+normalize(vec3(pos)));

        float intSpec = max(0, dot(h,normalize(n)));
        spec = vec4(1) * pow(intSpec,shininess);

    }
	vec4 color = texture(jupiter,tc);
	

	colorOut = max(intensity * color , color * 0.25);
	
}