#version 420

uniform mat3 m_normal;
uniform mat4 m_pvm, m_viewModel, m_view;
uniform sampler2D noise, baseTex, baseNorm, highTex, highNorm, lowTex, lowNorm, waterTex;
uniform float shininess = 128, highHeight, lowHeight, gamma, nTextures, highNormalMult, lowNormalMult, baseNormalMult, waterHeight;
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
	
	
	vec4 texColor;
	
	if(pos.y<=waterHeight+0.01){
		texColor= texture(waterTex,texc);
	}else{

		vec4 cBase = texture(baseTex,texc);
		vec4 cHigh = texture(highTex,texc);
		float f = smoothstep(-1.0, 1.0, highHeight + rand(texc) - pos.y);
		texColor = mix(cHigh,cBase,f);
		float f2;
		if(f == 1){	
			vec4 cLow = texture(lowTex,texc);
			f2= smoothstep(-2.0, 2.0, lowHeight + rand(texc) -  pos.y);
			texColor = mix(cBase, cLow, f2);
		}
		if(terrainNorm==1){
		
			vec3 lowNorm = lowNormalMult* normalize(m_normal* vec3(texture(lowNorm,texc)));
			vec3 baseNorm = baseNormalMult* normalize(m_normal* vec3(texture(baseNorm,texc)));
			vec3 highNorm =	highNormalMult* normalize(m_normal* vec3(texture(highNorm,texc)));

			vec3 normalMix =mix(highNorm,baseNorm,f);
			normalMix = mix(normalMix, lowNorm,f2);
			
			normal =normalize( normal +normalMix);

    	}


		
	}



	// get texture normals
	
		
	float intensity = ambient.x+ max(dot(normal,l_dir), 0.0) * gamma;

    texColor = intensity * texColor;
    colorOut = texColor;


}