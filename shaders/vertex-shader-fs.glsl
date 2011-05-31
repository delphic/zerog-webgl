#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec3 vLightWeighting;
			
uniform vec4 uColor;
uniform sampler2D uSampler;

void main(void) {
	vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
	gl_FragColor = vec4(textureColor.rgb * uColor.rgb * vLightWeighting, textureColor.a); // TODO: think about how to use, uColor alpha and if we should
}