#version 420

uniform mat3 m_normal;
uniform mat4 m_pvm, m_viewModel, m_view;
uniform sampler2D noise, baseTex, baseNorm, highTex, highNorm, lowTex, lowNorm;
uniform float shininess = 128, highHeight, lowHeight, gamma, nTextures, highNormalMult, lowNormalMult, baseNormalMult;
uniform int terrainNorm; 
uniform	vec4 ambient;
in vec3 n, lDir, eye;
in vec2 tc;
in vec4 pos;

out vec4 colorOut;


float rand(vec2 v){
    return texture(noise,v).x;
}

void main() {

    // normalize vectors
	vec3 normal = normalize(n);
	vec3 eye = normalize(eye);
	vec3 l_dir = normalize(lDir);
	vec2 texc= tc * nTextures;
	
	vec4 cBase = texture(baseTex,texc);
	vec4 cHigh = texture(highTex,texc);
	float f = smoothstep(-1.0, 1.0, highHeight + rand(texc) - pos.y);
	vec4 texColor = mix(cHigh,cBase,f);
	// Low
	float f2;
	if(f == 1)
	{	
		vec4 cLow = texture(lowTex,texc);
		f2 = smoothstep(-2.0, 2.0, lowHeight + rand(texc) -  pos.y);
		texColor = mix(cBase, cLow, f2);
	}

	// get texture normals
	if(terrainNorm==1){
		
		vec3 lowNorm = lowNormalMult* normalize(m_normal* vec3(texture(lowNorm,texc)));
		vec3 baseNorm = baseNormalMult* normalize(m_normal* vec3(texture(baseNorm,texc)));
		vec3 highNorm =	highNormalMult* normalize(m_normal* vec3(texture(highNorm,texc)));

		vec3 normalMix =mix(highNorm,baseNorm,f);
		normalMix = mix(normalMix, lowNorm,f2);
		
		normal =normalize( normal +normalMix);

    }
		
	// get texture data
	//vec4 texColor = texture(baseTex, texc);
	float intensity = ambient.x+ max(dot(normal,l_dir), 0.0) * gamma;


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

    texColor = intensity * texColor;
    colorOut = texColor;


}