#version 420

uniform mat3 m_normal;
uniform mat4 m_pvm, m_viewModel, m_view;
uniform sampler2D noise, baseTex, baseNorm, highTex, highNorm, lowTex, lowNorm, waterTex, waterNorm;
uniform float gamma, nTextures, highHeight, lowHeight, waterHeight, highNormalMult, lowNormalMult, baseNormalMult, waterNormalMult;
uniform int terrainNorm; 
uniform	vec4 ambient;

in vec2 tc;
in vec3 n, lDir, eye;
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
	
	vec4 texColor;
	float deviation = 0.1;
	
	if(pos.y <= waterHeight + deviation){

		vec4 cLow = texture(lowTex,texc);

		float f = smoothstep(0.0, deviation, waterHeight + deviation - pos.y);

		texColor= mix(cLow,texture(waterTex,texc),f);

		// get texture normals
		if(terrainNorm==1){

			vec3 lowNorm = lowNormalMult * normalize(m_normal * vec3(texture(lowNorm,texc)));
			vec3 waterNorm = waterNormalMult * normalize(m_normal * vec3(texture(waterNorm,texc)));

			normal = normalize(normal + mix(lowNorm,waterNorm,f));
		}

	}else{

		vec4 cBase = texture(baseTex,texc);
		vec4 cHigh = texture(highTex,texc);
		float f = smoothstep(-1.0, 1.0, highHeight + rand(texc) - pos.y);
		texColor = mix(cHigh,cBase,f);
		float f2 = 0;
		if(f == 1){	
			vec4 cLow = texture(lowTex,texc);
			f2= smoothstep(-2.0, 2.0, lowHeight + rand(texc) - pos.y);
			texColor = mix(cBase, cLow, f2);
		}

		// get texture normals
		if(terrainNorm==1){
		
			vec3 lowNorm = lowNormalMult* normalize(m_normal* vec3(texture(lowNorm,texc)));
			vec3 baseNorm = baseNormalMult* normalize(m_normal* vec3(texture(baseNorm,texc)));
			vec3 highNorm =	highNormalMult* normalize(m_normal* vec3(texture(highNorm,texc)));

			vec3 normalMix =mix(highNorm,baseNorm,f);
			normalMix = mix(normalMix, lowNorm,f2);
			
			normal =normalize(normal + normalMix);

    	}

		
	}
	
		
	float intensity = ambient.x + max(dot(normal,l_dir), 0.0) * gamma;

    texColor = intensity * texColor;
    colorOut = texColor;


}