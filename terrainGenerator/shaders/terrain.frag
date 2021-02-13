#version 330

uniform mat3 m_normal;
uniform mat4 m_pvm, m_view;
uniform sampler2D noise, baseTex, baseNorm, highTex, highNorm, lowTex, lowNorm, waterTex, waterNorm;
uniform sampler2D baseTex2, baseNorm2, highTex2, highNorm2, lowTex2, lowNorm2, waterTex2, waterNorm2;
uniform float gamma, nTextures, highHeight, lowHeight, waterHeight, highNormalMult, lowNormalMult, baseNormalMult, waterNormalMult;
uniform int terrainNorm, scene; 
uniform	vec4 ambient;

in vec2 tc;
in vec3 n, lDir;
in vec4 pos;

out vec4 colorOut;


float rand(vec2 v){
    return texture(noise,v).x;
}

void main() {

    // normalize vectors
	vec3 normal = normalize(n);
	vec3 l_dir = normalize(lDir);
	vec2 texc= tc * nTextures;

	vec4 thisBaseTex, thisBaseNorm, thisHighTex, thisHighNorm, thisLowTex, thisLowNorm,thisWaterTex, thisWaterNorm;
	if(scene == 0){
		thisWaterTex = texture(waterTex,texc);
		thisWaterNorm = texture(waterNorm,texc);
		thisBaseTex = texture(baseTex,texc);
		thisBaseNorm = texture(baseNorm,texc);
		thisHighTex = texture(highTex,texc);
		thisHighNorm = texture(highNorm,texc);
		thisLowTex = texture(lowTex,texc);
		thisLowNorm = texture(lowNorm,texc);

	}else{
		thisWaterTex = texture(waterTex2,texc);
		thisWaterNorm = texture(waterNorm2,texc);
		thisBaseTex = texture(baseTex2,texc);
		thisBaseNorm = texture(baseNorm2,texc);
		thisHighTex = texture(highTex2,texc);
		thisHighNorm = texture(highNorm2,texc);
		thisLowTex = texture(lowTex2,texc);
		thisLowNorm = texture(lowNorm2,texc);

	}
	
	vec4 texColor;
	float deviation = 0.1;
	
	if(pos.y <= waterHeight + deviation){


		float f = smoothstep(0.0, deviation, waterHeight + deviation - pos.y);

		texColor= mix(thisLowTex,thisWaterTex,f);

		// get texture normals
		if(terrainNorm==1){

			vec3 lowNorm = lowNormalMult * normalize(m_normal * vec3(thisLowNorm));
			vec3 waterNorm = waterNormalMult * normalize(m_normal * vec3(thisWaterNorm));

			normal = normalize(normal + mix(lowNorm, waterNorm, f));
		}

	}else{

		float f = smoothstep(-2.0, 2.0, highHeight + rand(texc) - pos.y);
		texColor = mix(thisHighTex,thisBaseTex,f);
		float f2 = 0;
		if(f == 1){	
			f2= smoothstep(-2.0, 2.0, lowHeight + rand(texc) - pos.y);
			texColor = mix(thisBaseTex, thisLowTex, f2);
		}

		// get texture normals
		if(terrainNorm==1){
		
			vec3 lowNorm = lowNormalMult * normalize(m_normal * vec3(thisLowNorm));
			vec3 baseNorm = baseNormalMult * normalize(m_normal * vec3(thisBaseNorm));
			vec3 highNorm =	highNormalMult * normalize(m_normal * vec3(thisHighNorm));

			vec3 normalMix =mix(highNorm, baseNorm, f);
			normalMix = mix(normalMix, lowNorm, f2);
			
			normal =normalize(normal + normalMix);

    	}

		
	}
	
		
	float intensity = ambient.x + max(dot(normal,l_dir), 0.0) * gamma;

    texColor = intensity * texColor;
    colorOut = texColor;


}