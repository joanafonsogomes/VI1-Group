#version 420

uniform	vec4 diffuse = vec4(1.0);
uniform sampler2D noise, baseTex, baseNorm, highTex, highNorm;
uniform float shininess = 128;
uniform int terrainNorm; 
uniform mat3 m_normal;
uniform mat4 m_pvm, m_viewModel, m_view;

in vec3 n, lDir, eye;
in vec2 tc;
in vec4 pos;

out vec4 colorOut;

void main() {

    // normalize vectors
	vec3 normal = normalize(n);
	vec3 eye = normalize(eye);
	vec3 l_dir = normalize(lDir);
	vec2 texc= tc*10;

	vec4 cBase = texture(baseTex,texc);
	vec4 cHigh = texture(highTex,texc);
	float f = smoothstep(0.7, 1.0, 9 - (inverse(m_viewModel) * -pos).y);
	vec4 texColor = mix(cHigh,cBase,f);

	// get texture normals
	if(terrainNorm==1){
        //normal = normal + m_normal * normalize(vec3(texture(baseNorm,texc)));

       	vec4 nBase = texture(baseNorm,texc);
		vec4 nHigh = texture(highNorm,texc);
        vec4 texNorm = mix(nHigh,nBase,f);
		normal = normal + m_normal * normalize(vec3(texNorm));
       
    }
		
	// get texture data
	//vec4 texColor = texture(baseTex, texc);
	float intensity = max(dot(normal,normalize(l_dir)), 0.0);


    /*
    vec4 texRust = texture(rust, tc);
	vec4 texSpecular = texture(specularMap, tc);
	float noise = texture(noise, tc).r;
	
	// mix rust with diffuse
	float f = smoothstep(rusting, rusting+0.05, noise);
	vec4 color = mix(texColor, texRust, f);
	
	// set the specular term to black
	vec4 spec = vec4(0.0);


	

	// if the vertex is lit and there is little or no rust
	// compute the specular color
	if (intensity > 0.0 && f < rusting+0.05) {
		// compute the half vector
		vec3 h = normalize(l_dir + eye);	
		// compute the specular intensity
		float intSpec = max(dot(h,normal), 0.0);
		// compute the specular term into spec
		spec = texSpecular * pow(intSpec,shininess);
	}
    */
	//colorOut = max(intensity * color + spec +  color * 0.5,0);

    texColor=intensity*texColor;
    colorOut = texColor;


}