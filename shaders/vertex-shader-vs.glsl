attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;

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

uniform bool uUseLighting;

varying vec2 vTextureCoord;
varying vec3 vLightWeighting;

void main(void) {
	vec4 mvPosition = uMVMatrix * vec4(aVertexPosition, 1.0);
	gl_Position = uPMatrix * mvPosition;
	vTextureCoord = aTextureCoord;
	
	if(!uUseLighting) {
		vLightWeighting = vec3(1.0, 1.0, 1.0);
	}else {
		vec3 transformedNormal = normalize(uNMatrix * aVertexNormal);
		
		/* Point Lights */
		/* TODO: Investigate using just vertexposition instead of mvPosition and not transforming the normals */
		vec3 pointLightComponent;
		for(int i = 0; i < 8; i++) {
			if (i >= uPointLightNumber) { break; }
			float pointLightDistance = length(uPointLightingLocation[i] - mvPosition.xyz);
			vec3 pointLightDirection = normalize(uPointLightingLocation[i] - mvPosition.xyz);
			float pointLightWeighting = max(dot(transformedNormal, pointLightDirection), 0.0) / (pointLightDistance*pointLightDistance);
			
			pointLightComponent += uPointLightingColor[i] * pointLightWeighting;
		}
		
		/* Spot Lights */
		vec3 spotLightComponent;
		for(int i = 0; i < 8; i++) {
			if (i >= uSpotLightNumber) { break; }
			float spotLightWeighting;
			/* Check if position in the cone */
			float angleToMv = acos(dot((mvPosition.xyz - uSpotLightLocation[i]), uSpotLightDirection[i])/(length(uSpotLightDirection[i])*length(uSpotLightLocation[i] - mvPosition.xyz)));
			if (angleToMv > 0.5*uSpotLightThi[i]) { spotLightWeighting = 0.0; }
			else if (angleToMv > 0.5*uSpotLightTheta[i] && angleToMv < 0.5*uSpotLightThi[i]) {
				spotLightWeighting = max(dot(transformedNormal, normalize(uSpotLightLocation[i] - mvPosition.xyz)), 0.0) / (uSpotLightFalloff[i] * length(uSpotLightLocation[i] - mvPosition.xyz) * uSpotLightThi[i]);
			}
			else {
				spotLightWeighting = max(dot(transformedNormal, normalize(uSpotLightLocation[i] - mvPosition.xyz)), 0.0) / (length(uSpotLightLocation[i] - mvPosition.xyz) * uSpotLightTheta[i]);
			}
			spotLightComponent += uSpotLightColor[i] * spotLightWeighting;
		}
		/* Directional Light - Does uLightDirecetion need to be normalised */
		float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);
		
		vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting + pointLightComponent + spotLightComponent;
	}
}