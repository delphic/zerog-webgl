precision highp float;

varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;

uniform vec4 uColor;

/* Lighting */
uniform vec3 uAmbientColor;

uniform vec3 uLightingDirection;
uniform vec3 uDirectionalColor;

/* Max Point Lights: 8 */
uniform int uPointLightNumber;
uniform vec3 uPointLightingLocation[8];
uniform vec3 uPointLightingColor[8];

/* Spot Lights */
uniform int uSpotLightNumber;
uniform vec3 uSpotLightLocation[8];
uniform vec3 uSpotLightDirection[8];
uniform vec3 uSpotLightColor[8];
uniform float uSpotLightTheta[8];
uniform float uSpotLightThi[8];
uniform float uSpotLightFalloff[8];

uniform float uMaterialShininess;

uniform bool uUseLighting;
uniform bool uUseSpecular;

uniform bool uUseTextures;

uniform sampler2D uSampler;


void main(void) {
	vec3 lightWeighting;
	if (!uUseLighting) {
		lightWeighting = vec3(1.0, 1.0, 1.0);
	} else {
		/* For Specular Lighting */
		vec3 eyeDirection = normalize(-vPosition.xyz);
	
		/* Point Lights */
		vec3 pointLightComponent;
		for(int i = 0; i < 8; i++) {
			if (i >= uPointLightNumber) { break; }
			float pointLightDistance = length(uPointLightingLocation[i] - vPosition.xyz);
			vec3 pointLightDirection = normalize(uPointLightingLocation[i] - vPosition.xyz);
			float pointLightWeighting = max(dot(vTransformedNormal, pointLightDirection), 0.0) / (pointLightDistance*pointLightDistance);
			/* Specular */
			float specularLightWeighting = 0.0;
			if (uUseSpecular) {
				vec3 reflectionDirection = reflect(-pointLightDirection, vTransformedNormal);
				specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uMaterialShininess);
			}
			pointLightComponent += uPointLightingColor[i] * pointLightWeighting + uPointLightingColor[i] * specularLightWeighting;
		}
		
		/* Spot Lights */
		vec3 spotLightComponent;
		for(int i = 0; i < 8; i++) {
			if (i >= uSpotLightNumber) { break; }
			float spotLightWeighting;
			float specularLightWeighting = 0.0;
			/* Check if position in the cone */
			float angleToMv = acos(dot((vPosition.xyz - uSpotLightLocation[i]), uSpotLightDirection[i])/(length(uSpotLightDirection[i])*length(uSpotLightLocation[i] - vPosition.xyz)));
			if (angleToMv > 0.5*uSpotLightThi[i]) { spotLightWeighting = 0.0; }
			else if (angleToMv > 0.5*uSpotLightTheta[i] && angleToMv < 0.5*uSpotLightThi[i]) {
				spotLightWeighting = max(dot(vTransformedNormal, normalize(uSpotLightLocation[i] - vPosition.xyz)), 0.0) / (uSpotLightFalloff[i] * length(uSpotLightLocation[i] - vPosition.xyz) * uSpotLightThi[i]);
				/* Specular */
				if (uUseSpecular) {
					vec3 reflectionDirection = reflect(-normalize(uSpotLightLocation[i] - vPosition.xyz), vTransformedNormal);
					specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uMaterialShininess);
				}
			}
			else {
				spotLightWeighting = max(dot(vTransformedNormal, normalize(uSpotLightLocation[i] - vPosition.xyz)), 0.0) / (length(uSpotLightLocation[i] - vPosition.xyz) * uSpotLightTheta[i]);
				/* Specular */
				if (uUseSpecular) {
					vec3 reflectionDirection = reflect(-normalize(uSpotLightLocation[i] - vPosition.xyz), vTransformedNormal);
					specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uMaterialShininess);
				}
			}
			spotLightComponent += uSpotLightColor[i] * spotLightWeighting + uSpotLightColor[i] * specularLightWeighting;
		}
		/* Directional Light - Does uLightDirecetion need to be normalised */
		float directionalLightWeighting = max(dot(vTransformedNormal, uLightingDirection), 0.0);
		
		lightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting + pointLightComponent + spotLightComponent;
	} 
	if(uUseTextures) {
		vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
		gl_FragColor = vec4(textureColor.rgb  * uColor.rgb * lightWeighting, textureColor.a);
	}
	else {
		gl_FragColor = vec4(uColor.rgb * lightWeighting, uColor.a);
	}
}